const express = require('express');
const router = express.Router();

const _ =require('lodash');
const bcrypt = require('bcrypt');
const Joi = require('@hapi/joi');

const { User, validate } = require('../models/user');

const auth = require('../middleware/auth');

//routes
router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    console.log(user)
    return res.send(user);
});

//user register
router.post('/register', async (req,res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send({ message: `Validation error: ${error.details[0].message}` });
    //password required to be checked seperately
    if (!req.body.password) return res.status(400).send({ message:`Password is required.` });
    
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).json({ message: `User already registered.` });

    user = new User(_.pick(req.body, ['name','email','password']));
    user.password = await bcrypt.hash(user.password, await bcrypt.genSalt(10));

    try {
        await user.save();
        const token = user.generateAuthToken();
        user = _.pick(user, ['name', 'email', '_id']);
        return res.header('x-auth-token', token).send(user); 
    } catch(err) {
         return res.status(400).send(err.message);
    } 
    
});

//user login post
router.post('/login', async (req,res) => {

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
    const schema = Joi.object({
        email: Joi.string().email().required().min(5).max(255),
        password: Joi.string().required().min(8).max(255),
    });
    return schema.validate(user);
}
module.exports = router;
