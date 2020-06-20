const Joi = require('@hapi/joi');
const _ = require('lodash');
const mongoose = require('mongoose');

//schema validate mongoose
const sessionSchema = new mongoose.Schema({
	user_id: { 
		type: String, 
		required: true
		},
	email: { 
		type: String, 
		required: true 
	},
	token: { 
		type: String, 
		required: true, 
	},
	isValid: {
		type: Boolean,
		default: true
	},
	date: { 
		type: Date,
		default: Date.now
	},
	updatad_at:{ 
		type: Date
	},
	status: { 
		type: String,
		default: 'logged' 
	}
});

//model
const Session = mongoose.model('Session', sessionSchema);

const sessionValidate = (session) => {    
	const schema = Joi.object({
		user_id: Joi.string().required(),
		email: Joi.string().email().required(),
		token: Joi.string().email().required()
	});
	return schema.validate(session);
};

exports.Session = Session;
exports.sessionValidate = sessionValidate;
