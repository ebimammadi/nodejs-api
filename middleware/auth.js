const jwt = require('jsonwebtoken');
const _ = require('lodash');

const { User } = require('../models/user');
const { Session } = require('../models/session');
const { cookieSetting } = require('../middleware/headersCookie');
const { updateSession } = require('../middleware/session');//! it should be used instead of Session

const auth = async(req, res, next) => {
	const token = req.cookies["x-auth-token"];
	if (!token) return res.status(401).json({ message: 'No valid token! Access denied.'});
	try{
		const refreshedToken = refreshToken(token);
		await updateSession(token,refreshedToken);
		res.cookie('x-auth-token', refreshedToken, cookieSetting);
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
