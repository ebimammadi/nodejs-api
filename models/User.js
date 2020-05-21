const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi');
const passwordComplexity = require('joi-password-complexity');
const _ = require('lodash');
const mongoose = require('mongoose');

//schema validate mongoose
const userSchema = new mongoose.Schema({
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
        default: Date.now
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    userType: { 
        type: String, 
        enum: ['user','admin'],
        default: 'user'  
    }
});

//generates a user token per login/register
userSchema.methods.generateAuthToken = function() {
    const payload = _.pick(this, ['email','name','_id']);
    payload.exp = Math.floor(Date.now() / 1000) + (3600);
    return token = jwt.sign( payload, process.env.JWT_KEY );
}

//model
const User = mongoose.model('User', userSchema);

const validateUser = (user) => {    
    const schema = Joi.object({
        name: Joi.string().required().min(5).max(255),
        email: Joi.string().email().required().min(5).max(255),
        password: passwordComplexity({
            required: true,
            min: 8,
            max: 255,
            lowerCase: 1,
            upperCase: 1,
            numeric: 1,
            symbol: 1,
            requirementCount: 4
        })
    });
    return schema.validate(user);
};

exports.User = User;
exports.validate = validateUser;
