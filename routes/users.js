const _ =require('lodash');
const { User, validate } = require('../models/User');
const bcrypt = require('bcrypt');
//const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

async function run() {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('sdadsad',salt);
    console.log(salt);
    console.log(hashed);
}
//run();

//routes
router.post('/register', async (req,res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(`validationError: ${error.details[0].message}`)
    
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).json({ message: 'User already registered.' });

    user = new User(_.pick(req.body, ['name','email','password']));
    //const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password,await bcrypt.genSalt(10));

    try {
        await user.save();
        return res.send(_.pick(user, ['_id','name','email']));
    } catch(err) {
         return res.status(400).send(err.message);
    } 
    
});

module.exports = router;
