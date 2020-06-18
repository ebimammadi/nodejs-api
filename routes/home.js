const express = require('express');
const router = express.Router(); 
const jwt = require('jsonwebtoken');

const auth = require('../middleware/auth');
const mailer = require('../components/nodemailer');

router.get('/',auth, (req,res) => {
	return res.json({ message: 'you are on home page, What are you looking for!' });
});

router.get('/about',auth, (req,res) => {
	return res.json({ message: 'this is an application for optimizing parcel deliveries.' });
});

module.exports = router;
