const express = require('express');
const router = express.Router();
const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const { User } = require('../models/user');
 
//user login post
router.post('/', async (req,res) => {

    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(`validationError: ${error.details[0].message}`)
    
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid email or password.' });

    const token = user.generateAuthToken();
    user = _.pick(user, ['name', 'email', '_id']);
    return res.header('x-auth-token', token).send(user); 
    
    //write in login-collectoin (to database)

});

const validateUser = (user) => {    
    const schema = {
        email: Joi.string().email().required().min(5).max(255),
        password: Joi.string().required().min(8).max(255),
    };
    return Joi.validate(user,schema);
}

module.exports = router;
