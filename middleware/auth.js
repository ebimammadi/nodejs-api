const jwt = require('jsonwebtoken');
const _ = require('lodash');

const { User } = require('../models/user');
const { cookieSetting } = require('../middleware/headersCookie');

const auth = (req, res, next) => {
	const token = req.cookies["x-auth-token"];
	if (!token) return res.status(401).json({ message: 'No valid token! Access denied.'});
	
	try{
		const decodedToken = jwt.verify(token, process.env.JWT_KEY);
		const user = new User(_.pick( decodedToken, ['name','email','password']));
		const refreshedToken = user.generateAuthToken();
		res.cookie('x-auth-token', refreshedToken, cookieSetting)
		//res.cookie('testing', Date.now())
		next();
	} 
	catch (ex) {
		return res.status(400).json({ message: 'Invalid token!'});
	}
}

module.exports = auth;
