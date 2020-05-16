const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');

router.get('/', (req,res) => {
    //this is a sample for a default API request
    return res.json({ message: 'What are you looking for!' });
});

router.get('/validate', auth, (req,res) => {
    //this is a sample for a default API request
    return res.json({ message: 'You are in!' });
});
module.exports = router;