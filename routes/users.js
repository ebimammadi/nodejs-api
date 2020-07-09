const express = require('express');
const router = express.Router();
const _ =require('lodash');
const bcrypt = require('bcrypt');
//const Joi = require('@hapi/joi');//!Depricated
const jwt = require('jsonwebtoken');
const sha256 = require('js-sha256');

const mailer = require('../components/nodemailer');
const { User, validateUser } = require('../models/user');
const auth = require('../middleware/auth');

const { cookieSetting } = require('../middleware/headersCookie.js');
const { createSession, updateSession } = require('../middleware/session');
const { urlPath } = require('../lib');

router.post('/register', async (req,res) => {
	if (!req.body.password) return res.send({ message:`'Password' is required.` });
	const { error } = validateUser.register(req.body);
	if (error) return res.json({ message: error.details[0].message });
	
	try {
		let user = await User.findOne({ email: req.body.email });
		if (user) return res.json({ message: `User already registered.` });

		user = new User(_.pick(req.body, ['name','email','password']));
		user.password = await bcrypt.hash(user.password, await bcrypt.genSalt(10));
		user.emailVerify = sha256( user._id + Date.now()); 
		await user.save();
		await mailer(user.email,`Welcome to ${process.env.APP_NAME}`,user,'userRegisterTemplate');
		const token = user.generateAuthToken();
		await createSession( {..._.pick(user, ['email', '_id']), token, status: 'Registered' }); //log log_session
		user = _.pick(user, ['name', 'email', '_id']);
		return res.header('x-auth-token', token)
					.cookie('x-auth-token', token, cookieSetting)
					.send(user); 
	} catch(err) {
			return res.status(400).send(err.message);
	} 
    
});
router.post('/login', async (req,res) => {

	const { error } = validateUser.login(req.body);
	if (error) return res.json({ message: error.details[0].message });
	
	let user = await User.findOne({ email: req.body.email });
	if (!user) return res.json({ message: 'Invalid email or password.' });

	const validPassword = await bcrypt.compare(req.body.password, user.password);
	if (!validPassword) return res.json({ message: 'Invalid email or password.' });

	if (!user.isActive) return res.json({ message: 'Your account seems de-activated.' });

	const token = user.generateAuthToken();
	await createSession( {..._.pick(user, ['email', '_id']), token }); //log_session
	user = _.pick(user, ['name', 'email', '_id']);
	return res.header('x-auth-token', token)
						.cookie('x-auth-token', token, cookieSetting)
						.send(user); 
});
router.post('/recover-password', async (req, res) => {
	//expected code&password
	const { error } = validateUser.recover(req.body);
	if (error) return res.json({ message: error.details[0].message });
	//password required to be checked seperately
	if (!req.body.password) return res.status(400).json({ message:`Password is required.` });
	

	try {
		let user = await User.findOne({ passwordRecoverCode: req.body.code });
		if (!user) return res.json({ message: `Recovery code is invalid.` });

		if (!user.isActive) return res.json({ message: 'Your account seems de-activated.' });

		const password = await bcrypt.hash(req.body.password, await bcrypt.genSalt(10));
		user.set({password: password ,passwordRecoverCode: '-' });
		
		//! expire other sessions which are signed in and active

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
router.post('/forget-password', async (req,res) => {
	if (!req.body.email) return res.status(400).send(`Invalid email`);
	try{
		let user = await User.findOne({ email: req.body.email });
		if (!user) {
			setTimeout( () => { return res.json({ message: `Invalid email` }); }, 5000 )
		}else {
			console.log('dadsad')
			const uniqueID = sha256( user._id + Date.now());
			user.set({ passwordRecoverCode: uniqueID});
			await user.save();
			await mailer(req.body.email,'Recovery Link', uniqueID, 'passwordRecoverTemplate').catch(console.error);
			return res.json({ response_type: 'success', message: `Your request would be processed shortly. Please check your mailbox.` });
		}
	}catch(err){
		return res.json({ response_type:`warning`, message: `${err.message}` });
	}
});

router.get('/recover-password-verify-code/:code', async (req,res) => {
	const code = req.params.code;
	let user = await User.findOne({ passwordRecoverCode: code });
	if (!user) return res.json({ message: `The link seems invalid.` });
	return res.json({ email: user.email, resposnse_type: `success`, message: `Set your new password.` });
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

router.get('/profile-get', auth, async (req, res) => {
	try {
		const { _id } = jwt.verify(req.cookies["x-auth-token"], process.env.JWT_KEY);
		const user = await User.findById(_id);
		const profile = _.pick( user, ["email", "name", "urls", "profilePhotoUrl" ] );
		profile.profilePhotoUrl = urlPath(user.profilePhotoUrl); //add suffix path 
		profile.emailVerify = user.emailVerify.startsWith('true') ;
		profile.mobileVerify = user.mobileVerify.startsWith('true');
		if (profile.urls.facebook === undefined) profile.urls = { facebook: '', instagram: '', website: '' };
		return res.send( profile );
	} catch (err) {
		console.log(err);
		return res.send({ response_type: 'warning', message: `Error on server!`});
	}
});
router.post('/profile-set', auth, async (req, res) => {
	try {
		const { error } = validateUser.profile(req.body);
		if (error) return res.json({ message: error.details[0].message });
		
		const { _id } = jwt.verify(req.cookies["x-auth-token"], process.env.JWT_KEY);
		const user = await User.findById(_id);
		user.set({ name: req.body.name, urls: req.body.urls });
		await user.save();
		return res.send({ response_type: 'success', message: `Profile Updated.` });//user);
	} catch (err) {
		console.log(err);
		return res.send({ response_type: 'warning', message: `Error on server!`});
	}
});
router.post('/email-set', auth, async (req, res) => {
	try {
		const { error } = validateUser.email(req.body);
		if (error) return res.json({ message: error.details[0].message });
		
		const { _id, email, name } = jwt.verify(req.cookies["x-auth-token"], process.env.JWT_KEY);
		const newEmail = req.body.email;
		if ( email == newEmail ) return res.json({ response_type: 'warning', message: `This is your current email.`});
		
		let user = await User.findById( _id );
		if (!user) return res.json({ message: 'Error! Invalid email.' });
		
		const validPassword = await bcrypt.compare(req.body.password, user.password);
		if (!validPassword) return res.json({ message: 'Invalid password.' });

		const checkUser = await User.find( { email: newEmail } );
		if (checkUser.length>0) return res.json({ response_type: 'warning', message: `This email is in use.`});
		
		//send warning notification to the previous email 
		await mailer(email,'Warning! Email changed.', { name } , 'emailChangeWarningTemplate').catch(console.error);
		//generate the verify link
		user.emailVerify = sha256( user._id + Date.now()); 
		user.email = newEmail;
		await user.save();
		//send verify link for the new email 
		await mailer(user.email,`Changed 'User Email' at ${process.env.APP_NAME}`,user,'emailChangeVerifyTemplate')
		return res.send({ response_type: 'success', message: `Your email has been updated, please check your mailbox for verification.` });
	} catch (err) {
		console.log(err);
		return res.send({ response_type: 'warning', message: `Error on server!`});
	}
});
router.post('/password-set', auth, async (req, res) => {
	try {
		if (!req.body.newPassword) return res.json({ message: `New password is required.` });
		const { error } = validateUser.password(req.body);
		if (error) return res.json({ message: error.details[0].message });
		const { _id } = jwt.verify(req.cookies["x-auth-token"], process.env.JWT_KEY);
		const user = await User.findById( _id );
		if (!user) return res.json({ message: `Error! Invalid password!` });
		
		const validPassword = await bcrypt.compare(req.body.password, user.password);
		if (!validPassword) return res.json({ message: `Invalid password.` });

		const password = await bcrypt.hash(req.body.newPassword, await bcrypt.genSalt(10));
		user.set({ password });
		await user.save();

		//! expire other sessions which are signed in and active

		//send verify link for the new email 
		await mailer(user.email,`Change password notice at ${process.env.APP_NAME}`,user,'passwordChangeTemplate')
		return res.send({ response_type: 'success', message: `Your password has been changed successfully.` });
	} catch (err) {
		console.log(err);
		return res.send({ response_type: 'warning', message: `Error on server!`});
	}
});
router.get('/send-verification-link', async (req,res) => {
	try{
		const { _id } = jwt.verify(req.cookies["x-auth-token"], process.env.JWT_KEY);
		const user = await User.findById(_id);
		user.emailVerify = sha256( user._id + Date.now()); 
		console.log(user.emailVerify);
		await user.save();
		await mailer(user.email,`Confirm your email at ${process.env.APP_NAME}`,user,'userEmailVerifyTemplate');
		return res.json({ response_type:`success`, message: `Verification code has been sent to your mail account. Please check your mailbox.` });
	} catch(err){
		return res.json({ response_type:`warning`, message: `${err.message}` });
	}
});

module.exports = router;
