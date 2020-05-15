const jwt = require('jsonwebtoken');
const PasswordComplexity = require('joi-password-complexity');
const Joi = require('joi');

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
    createDate: { 
        type: Date,
         Default: Date.now
    },
    isActivated: { 
        type: Boolean, 
        Default: true 
    },
    userType: { 
        type: String, 
        enum: ['user','admin'],
        Default: 'user'  
    }
});
//model
const User = mongoose.model('User', schema);

const validateUser = (user) => {
    const regexp = new RegExp("((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{8,255})");
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
    const schema = {
        name: Joi.string().required().min(5).max(255),
        email: Joi.string().email().required().min(5).max(255),
        password: new PasswordComplexity(complexityOptions).required()
        //password: Joi.string().required().min(8).max(255).regex(regexp)
        //.error(() => { return {message: 'Password in not complex'}})
        // .error(errors => {
        //     errors.forEach(err => {
        //       switch (err.type) {
        //         case "string.regex":
        //           err.message = "Value should not be empty!";
        //           break;
        //         case "string.min":
        //           err.message = `Value should have at least ${err.context.limit} characters!`;
        //           break;
        //         case "string.max":
        //           err.message = `Value should have at most ${err.context.limit} characters!`;
        //           break;
        //         default:
        //           break;
        //       }
        //     });
        //     return errors;
        //   }),
            //.error(() => { return {message: 'Password in not complex'}})
    };
    return Joi.validate(user,schema);
}
const complexityOptions = {
    min: 8,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 2,
  }
exports.User = User;
exports.validate = validateUser;