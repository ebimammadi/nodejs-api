const express = require('express');
const router = express.Router();
const _ =require('lodash');
const bcrypt = require('bcrypt');
//const Joi = require('@hapi/joi');//!Depricated
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');//!
const sha256 = require('js-sha256');

const mailer = require('../components/nodemailer');
const { User, userRegisterValidate, userLoginValidate, userRecoverValidate } = require('../models/user');

//! const auth = require('../middleware/auth'); not used yet

const { cookieSetting } = require('../middleware/headersCookie.js');
const { createSession, updateSession } = require('../middleware/session');
//const { binary } = require('@hapi/joi');


//user register signup
router.post('/register', async (req,res) => {
    const { error } = userRegisterValidate(req.body);
    if (error) return res.status(400).send({ message: `${error.details[0].message}` });
    //password required to be checked seperately
    if (!req.body.password) return res.status(400).send({ message:`Password is required.` });
		
		try {
			let user = await User.findOne({ email: req.body.email });
			if (user) return res.status(400).json({ message: `User already registered.` });

			user = new User(_.pick(req.body, ['name','email','password']));
			user.password = await bcrypt.hash(user.password, await bcrypt.genSalt(10));
			user.emailVerify = sha256( user._id + Date.now()); //uuidv4();

			await user.save();
			await mailer(user.email,`Welcome to ${process.env.APP_NAME}`,user,'userRegisterTemplate')
			const token = user.generateAuthToken();
			await createSession( {..._.pick(user, ['email', '_id']), token, status: 'Registered' }); //log_session
			user = _.pick(user, ['name', 'email', '_id']);
			return res.header('x-auth-token', token)
						.cookie('x-auth-token', token, cookieSetting)
						.send(user); 
    } catch(err) {
        return res.status(400).send(err.message);
    } 
    
});

router.post('/recover-password', async (req, res) => {
	//expected code&password
	const { error } = userRecoverValidate(req.body);
	if (error) return res.send({ message: `${error.details[0].message}` });
	//password required to be checked seperately
	if (!req.body.password) return res.status(400).json({ message:`Password is required.` });
	
	try {
		let user = await User.findOne({ passwordRecoverCode: req.body.code });
		if (!user) return res.json({ message: `Recovery code is invalid.` });

		const password = await bcrypt.hash(req.body.password, await bcrypt.genSalt(10));
		user.set({password: password ,passwordRecoverCode: '-' });
	
		await user.save();
		const token = user.generateAuthToken();
		await createSession( {..._.pick(user, ['email', '_id']), token, status: 'Recovered' }); //log_session
		user = _.pick(user, ['name', 'email', '_id']);
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

	const token = user.generateAuthToken();
	await createSession( {..._.pick(user, ['email', '_id']), token }); //log_session
	user = _.pick(user, ['name', 'email', '_id']);
	return res.header('x-auth-token', token)
						.cookie('x-auth-token', token, cookieSetting)
						.send(user); 
});

router.post('/forget-password', async (req,res) => {
	if (!req.body.email) return res.status(400).send(`Invalid email`);
	let user = await User.findOne({ email: req.body.email });
	
	if (!user) {
		setTimeout( () => { return res.json({ message: `Invalid email` }); }, 5000 )
	}else {
		console.log('dadsad')
		const uniqueID = sha256( user._id + Date.now()); //uuidv4()
		user.set({ passwordRecoverCode: uniqueID});
		await user.save();
		
		await mailer(req.body.email,'Recovery Link', uniqueID, 'passwordRecoverTemplate').catch(console.error);
		const message = `Your request would be processed shortly. Please check your mailbox.`
		return res.json({ response_type: 'success', message: message });
	}
});

router.get('/recover-password-verify-code/:code', async (req,res) => {
	const code = req.params.code;
	let user = await User.findOne({ passwordRecoverCode: code });
	if (!user) return res.json({ message: `The link seems invalid.` });
	return res.json({ email: user.email, message: `Set your new password.` });
});

router.get('/verify-email/:code', async (req,res) => {
	try{
		const code = req.params.code;//! validatation required
		const user = await User.findOne({ emailVerify: code });
		if (!user) return res.json({ response_type:`warning`, message: `The link seems invalid.`, });
		const utcNow = () => { const now = new Date(); return now.toISOString(); }
		user.set({ emailVerify: `true-${utcNow()}` });
		await user.save();
		return res.json({ response_type:`success`, message: `` });
	} catch(err){
		return res.json({ response_type:`warning`, message: `${err.message}` });
	}
});

router.get('/logout', async (req,res) => {
	const token = req.cookies["x-auth-token"];
	try {
		await updateSession(token,'invalid-'+token,'Signed-out');
		return res.clearCookie('x-auth-token').json({message: 'ok'}); //header('x-auth-token', '-')
	} catch(err) {
		return res.clearCookie('x-auth-token').json({message: err.message});
	}
});

// router.get('/me', auth, async (req, res) => {
// 	try {
// 		const user = await User.findById(req.user._id).select('-password');
// 		console.log(user)
// 		return res.send(user);
// 	} catch (err) {
// 		console.log(err);
// 		return res.status(400).send({ message: `Error on server!`});
// 	}
// });

// router.get('/get-profile-photo', auth, async (req, res) => {
// 	//const file = { name: req.body.name, file: binary(req.body.files.uploadedFile.data) }
// 	insertFile(file, res)
// });

// router.post('/set-profile-photo', auth, async (req, res) => {
// 	const file = { name: req.body.name, file: binary(req.body.files.uploadedFile.data) }
// 	insertFile(file, res)
// });

// function insertFile(file, res){
// 	//mongo 
// }

// router.get('/@@@@@@refresh', async(req,res) => {
// 	let token = req.header('x-auth-token');
// 	let refresh_token = req.header('refresh-token');
// 	if (!token || !refresh_token )
// 		return res.status(400).send({ message: 'Tokens are not available!' });
	
// 	const { email } = jwt.decode(token);
// 	const { email:emailFromRefreshToken } = jwt.decode(refresh_token);
// 	if ( email != emailFromRefreshToken)
// 		return res.status(400).send({ message: 'Tokens mismatch!' });
	
// 	try{
		
// 		let user = await User.findOne({ email: email });
// 		if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

// 		const decoded_refresh = jwt.verify(refresh_token, process.env.REFRESH_KEY + user.password); 
// 		const nowTimeStamp = Math.floor(Date.now()/1000);
		
// 		if (nowTimeStamp > decoded_refresh.exp){
// 			res.status(400).send({ message: 'Refresh token expired'});
// 		}
		
// 		token = user.generateAuthToken();
// 	 	refresh_token = user.generateRefreshToken();
// 		user = _.pick(user, ['name', 'email', '_id']);
// 		return res.header('x-auth-token', token)
// 							.header('refresh-token', refresh_token)
// 							.send(user); 

// 	} catch(err){
// 		console.log(err);
// 		return res.status(400).send({ message: `Error on server!`, ...err});
		
// 	}
	
// });

module.exports = router;
