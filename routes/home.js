const express = require('express');
const router = express.Router();

router.get('/', (req,res) => {
    //this is a sample for a default API request
    return res.json({ message: 'What are you looking for!' });
});

module.exports = router;