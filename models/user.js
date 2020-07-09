const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi');
const passwordComplexity = require('joi-password-complexity');
const _ = require('lodash');
const { urlRegexPattern } = require('../lib');

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
	userRole: { 
		type: String, 
		enum: [ 'user', 'admin', 'supplier' ],
		default: 'user'  
	},
	emailVerify: {
		type: String, 
		default: 'false'
	},
	passwordRecoverCode: {
		type: String, 
		default: '-'
	},
	profilePhotoUrl: {
		type: String
	},
	mobile: {
		type: String
	},
	mobileVerify: {
		type: String, 
		default: 'false'
	},
	urls: {
		facebook: { type: String, default: '' },
		instagram: { type: String, default: '' },
		website: { type: String, default: '' }
	}
});

//generates a jwt token
userSchema.methods.generateAuthToken = function() {
	const payload = _.pick(this, ['email','name','_id','userRole']);
	payload.exp = Math.floor(Date.now() / 1000) + (parseFloat(process.env.JWT_EXP_HOUR) * 3600);
	return token = jwt.sign( payload, process.env.JWT_KEY );
}

const passwordComplexityOptions = {
	required: true,
	min: 8,
	max: 255,
	lowerCase: 1,
	upperCase: 1,
	numeric: 1,
	symbol: 1,
	requirementCount: 4
}

//model
const User = mongoose.model('User', userSchema);

const userRegisterValidate = (user) => {    
	const schema = Joi.object({
		name: Joi.string().required().min(5).max(255),
		email: Joi.string().email().required().min(5).max(255),
		password: passwordComplexity( passwordComplexityOptions )
	});
	return schema.validate(user);
};

const userLoginValidate = (user) => {    
	const schema = Joi.object({
			email: Joi.string().email().required().min(5).max(255),
			password: Joi.string().required().min(8).max(255),
	});
	return schema.validate(user);
}

const userRecoverValidate = (user) => {    
	const schema = Joi.object({
		code: Joi.string().required().min(36),
		password: passwordComplexity( passwordComplexityOptions ) 
	});
	return schema.validate(user);
};

const userProfileValidate = (user) => {
	const schema = Joi.object({
		name: Joi.string().required().min(5),
		urls: {
			website: Joi.string().allow('').regex(urlRegexPattern),
			facebook: Joi.string().allow('').regex(urlRegexPattern),
			instagram: Joi.string().allow('').regex(urlRegexPattern),
		}
	});
	return schema.validate(user);
};

const userEmailValidate = (user) => {
	const schema = Joi.object({
		email: Joi.string().email().required().min(5).max(255),
		password: Joi.string().required().min(5).max(255)
	});
	return schema.validate(user);
};

const userPasswordValidate = (user) => {
	const schema = Joi.object({
		password: Joi.string().required().min(5).max(255),
		newPassword: passwordComplexity( passwordComplexityOptions )
	});
	return schema.validate(user);
};
exports.User = User;
exports.validateUser = { 
	register: userRegisterValidate,
	login: userLoginValidate,
	recover: userRecoverValidate,
	profile: userProfileValidate,
	email: userEmailValidate,
	password: userPasswordValidate
};