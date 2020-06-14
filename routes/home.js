const express = require('express');
const router = express.Router(); 

const auth = require('../middleware/auth');

router.get('/', (req,res) => {
	console.log(req.header('Cookie'));//! need to be developed
	//if (!req.header('Cookie')) return res.json({message: 'errror in token'})
	//this is a sample for a default API request
	return res.json({ message: 'What are you looking for!' });
});

router.get('/validate', auth, (req,res) => {
	//this is a sample for a default API request
	return res.json({ message: 'You are in!' });
});

module.exports = router;
