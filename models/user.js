const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi');
const passwordComplexity = require('joi-password-complexity');
const _ = require('lodash');

// trk : [{
// 	lat : String,
// 	lng : String
// 	 }]

const urlSchema = new mongoose.Schema({
	urls: [{
		name: {
			type: String, 
			unique: true,
			enum: ['facebook','instagram','twitter','website','other']
		},
		url: String
	}]
})

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
		enum: ['user','admin','supplier'],
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
		facebook: { type: String },
		instagram: { type: String },
		website: { type: String }
		// name: {
		// 	type: String, 
		// 	unique: true,
		// 	enum: ['facebook','instagram','twitter','website','other']
		// },
		// url: String
	}

});

//generates a jwt token
userSchema.methods.generateAuthToken = function() {
	const payload = _.pick(this, ['email','name','_id','userRole']);
	payload.exp = Math.floor(Date.now() / 1000) + (parseFloat(process.env.JWT_EXP_HOUR) * 3600);
	return token = jwt.sign( payload, process.env.JWT_KEY );
}

//model
const User = mongoose.model('User', userSchema);

const userRegisterValidate = (user) => {    
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
exports.userRegisterValidate = userRegisterValidate;
exports.userLoginValidate = userLoginValidate;
exports.userRecoverValidate = userRecoverValidate;
