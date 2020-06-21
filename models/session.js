const Joi = require('@hapi/joi');
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
		type: Date,
	},
	status: { 
		type: String,
		default: 'logged' 
	}
});

//model
const Session = mongoose.model('log_session', sessionSchema);

exports.Session = Session;
