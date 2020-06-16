const jwt = require('jsonwebtoken');
const _ = require('lodash');

const { User } = require('../models/user');
const { cookieSetting } = require('../middleware/headersCookie');

const auth = (req, res, next) => {
	const token = req.cookies["x-auth-token"];
	if (!token) return res.status(401).json({ message: 'No valid token! Access denied.'});
	
	try{
		
		res.cookie('x-auth-token', refreshToken(token), cookieSetting)
		next();
	} 
	catch (ex) {
		return res.status(400).json({ message: 'Invalid token!'});
	}
}

const refreshToken = (previousToken) => {
	const decodedToken = jwt.verify(previousToken, process.env.JWT_KEY);
	const user = new User(_.pick( decodedToken, ['name','email','password','userType']));
	return user.generateAuthToken();
}

module.exports = auth;
