const express = require('express');
const router = express.Router(); 

const auth = require('../middleware/auth');

router.get('/',auth, (req,res) => {
	console.log('cookies',req.cookies);
	return res.json({ message: 'What are you looking for!' });
});

router.get('/validate',auth, (req,res) => {
	return res.json({ message: 'it is validated' });
});

module.exports = router;
