const express = require('express');
const router = express.Router();
const _ =require('lodash');
const bcrypt = require('bcrypt');
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const mailer = require('../components/nodemailer');
const { User, userRegisterValidate, userLoginValidate, userRecoverValidate } = require('../models/user');

const auth = require('../middleware/auth');

const { cookieSetting } = require('../middleware/headersCookie.js');

//routes
router.get('/me', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select('-password');
		console.log(user)
		return res.send(user);
	} catch (err) {
		console.log(err);
		return res.status(400).send({ message: `Error on server!`});
	}
});

//user register signup
router.post('/register', async (req,res) => {
    const { error } = userRegisterValidate(req.body);
    if (error) return res.status(400).send({ message: `${error.details[0].message}` });
    //password required to be checked seperately
    if (!req.body.password) return res.status(400).send({ message:`Password is required.` });
    
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).json({ message: `User already registered.` });

    user = new User(_.pick(req.body, ['name','email','password']));
		user.password = await bcrypt.hash(user.password, await bcrypt.genSalt(10));

    try {
				await user.save();
				user = _.pick(user, ['name', 'email', '_id']);
				const token = user.generateAuthToken();
				return res.header('x-auth-token', token)
							.cookie('x-auth-token', token, cookieSetting)
							.send(user); 
    } catch(err) {
         return res.status(400).send(err.message);
    } 
    
});

router.post('/recover-password', async (req,res) => {
	//expected code&password
	const { error } = userRecoverValidate(req.body);
	if (error) return res.send({ message: `${error.details[0].message}` });
	//password required to be checked seperately
	if (!req.body.password) return res.status(400).json({ message:`Password is required.` });
	
	let user = await User.findOne({ passwordRecoverCode: req.body.code });
	if (!user) return res.json({ message: `Recovery code is invalid.` });

	const password = await bcrypt.hash(req.body.password, await bcrypt.genSalt(10));
	user.set({password: password ,passwordRecoverCode: '-' });

	try {
		await user.save();
		user = _.pick(user, ['name', 'email', '_id']);
		const token = user.generateAuthToken();
		return res.header('x-auth-token', token)
					.cookie('x-auth-token', token, cookieSetting)
					.send(user); 
	} catch(err) {
		return res.status(400).send(err.message);
	} 
	
});

//user login post
router.post('/login', async (req,res) => {

	const { error } = userLoginValidate(req.body);
	if (error) return res.status(400).send(`validationError: ${error.details[0].message}`)
	
	let user = await User.findOne({ email: req.body.email });
	if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

	const validPassword = await bcrypt.compare(req.body.password, user.password);
	if (!validPassword) return res.status(400).json({ message: 'Invalid email or password.' });

	if (!user.isActive) return res.status(400).json({ message: 'Your account seems de-activated.' });

	user = _.pick(user, ['name', 'email', '_id']);
	const token = user.generateAuthToken();	
	return res.header('x-auth-token', token)
						.cookie('x-auth-token', token, cookieSetting)
						.send(user); 
	
	//!write in logins-collectoin (to database) for controlling sessions
	
});

router.post('/forget-password', async (req,res) => {
	if (!req.body.email) return res.status(400).send(`Invalid email`);
	let user = await User.findOne({ email: req.body.email });
	const message = `Your request would be processed shortly. Please check your mailbox.`
	if (!user) return res.status(400).json({ message });
	const uniqueID = uuidv4()
	user.set({passwordRecover: uniqueID});
	await user.save();
	await mailer(req.body.email,'Recovery Link', uniqueID, 'passwordRecover').catch(console.error)
	return res.json({ message });
});

router.get('/recover-password-verify-code/:code', async (req,res) => {
	const code = req.params.code;
	let user = await User.findOne({ passwordRecoverCode: code });
	if (!user) return res.json({ message: `The link seems invalid.` });
	return res.json({ email: user.email, message: `Set your new password.` });
});

//Todo: add logout to the code

router.get('/@@@@@@refresh', async(req,res) => {
	let token = req.header('x-auth-token');
	let refresh_token = req.header('refresh-token');
	if (!token || !refresh_token )
		return res.status(400).send({ message: 'Tokens are not available!' });
	
	const { email } = jwt.decode(token);
	const { email:emailFromRefreshToken } = jwt.decode(refresh_token);
	if ( email != emailFromRefreshToken)
		return res.status(400).send({ message: 'Tokens mismatch!' });
	
	try{
		
		let user = await User.findOne({ email: email });
		if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

		const decoded_refresh = jwt.verify(refresh_token, process.env.REFRESH_KEY + user.password); 
		const nowTimeStamp = Math.floor(Date.now()/1000);
		
		if (nowTimeStamp > decoded_refresh.exp){
			res.status(400).send({ message: 'Refresh token expired'});
		}
		
		token = user.generateAuthToken();
	 	refresh_token = user.generateRefreshToken();
		user = _.pick(user, ['name', 'email', '_id']);
		return res.header('x-auth-token', token)
							.header('refresh-token', refresh_token)
							.send(user); 

	} catch(err){
		console.log(err);
		return res.status(400).send({ message: `Error on server!`, ...err});
		
	}
	
});

module.exports = router;
