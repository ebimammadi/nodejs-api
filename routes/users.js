const express = require('express');
const router = express.Router();
const _ =require('lodash');
const { User, validate, validatePassword } = require('../models/user');
const bcrypt = require('bcrypt');

const auth = require('../middlewares/auth');

//routes
router.get('/me', auth, async (req, res) => {
    console.log(req.user)
    const user = await User.findById(req.user._id).select('-password');
    return res.send(user);
});

router.post('/register', async (req,res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(`validationError: ${error.details[0].message}`)
    const { error: passwordError } = validatePassword(req.body.password);
    if (passwordError) return res.status(400).send(passwordError.details[0].message);
    
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).json({ message: 'User already registered.' });

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

module.exports = router;
