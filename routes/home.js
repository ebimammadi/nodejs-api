const express = require('express');
const router = express.Router(); 

const auth = require('../middleware/auth');

router.get('/', (req,res) => {
	return res.json({ message: 'you are on home page, What are you looking for!' });
});

router.get('/about',auth, (req,res) => {
	return res.json({ message: 'this is an application for optimizing parcel deliveries.' });
});

module.exports = router;
