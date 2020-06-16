const express = require('express');
const router = express.Router(); 
const jwt = require('jsonwebtoken');

const auth = require('../middleware/auth');
const mail = require('../components/nodemailer');

router.get('/',auth, (req,res) => {
	return res.json({ message: 'you are on home page, What are you looking for!' });
});

router.get('/about',auth, (req,res) => {
	//send email
	const token = req.cookies["x-auth-token"];
	const decodedToken = jwt.verify(token, process.env.JWT_KEY);
	mail(decodedToken.email,'Recover Password', `chapar.tech<br><br><h1>Recovery</h1>link ${token}`).catch(console.error)
	return res.json({ message: 'this is an application for optimizing parcel deliveries.' });
});

module.exports = router;
