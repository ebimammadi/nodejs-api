const jwt = require('jsonwebtoken');
const passwordComplexity = require('joi-password-complexity');
const Joi = require('joi');
const _ = require('lodash');
const mongoose = require('mongoose');

//schema
const schema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        minlength: 5, 
        maxlength: 255 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true, 
        minlength: 5, 
        maxlength: 1024 
    },
    date: { 
        type: Date,
        Default: Date.now
    },
    isActive: { 
        type: Boolean, 
        Default: true 
    },
    userType: { 
        type: String, 
        enum: ['user','admin'],
        Default: 'user'  
    }
},{ minimize: false,strict: false });

schema.methods.generateAuthToken = function() {
    return token = jwt.sign( _.pick(this, ['email','name','_id']), process.env.JWT_KEY );
}
//model
const User = mongoose.model('User', schema);

const validatePassword = (password) => {
    const complexityOptions = {
        min: 8,
        max: 255,
        lowerCase: 1,
        upperCase: 1,
        numeric: 1,
        symbol: 1,
        requirementCount: 4 
        /* 
           Min & Max not considered in the count. 
           Only lower, upper, numeric and symbol. 
           requirementCount could be from 1 to 4 
           If requirementCount=0, then it takes count as 4
       */
    };
    
    return passwordComplexity(complexityOptions).validate(password);
};

const validateUser = (user) => {    
    const schema = {
        name: Joi.string().required().min(5).max(255),
        email: Joi.string().email().required().min(5).max(255),
        password: Joi.string().required() //password complexity would be handled by validatePassword
    };
    return Joi.validate(user,schema);
};

exports.User = User;
exports.validate = validateUser;
exports.validatePassword = validatePassword;
