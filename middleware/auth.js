const jwt = require('jsonwebtoken');
const _ = require('lodash');

const { User } = require('../models/user');
const { cookieSetting } = require('../middleware/headersCookie');
const { updateSession } = require('../middleware/session');//! it should be used instead of Session

const auth = async(req, res, next) => {
	const token = req.cookies["x-auth-token"];
	if (!token) return res.status(403).json({ message: 'No valid token! Access denied.'});
	try{
		//refresh the token
		const decodedToken = jwt.verify(token, process.env.JWT_KEY);
		const user = new User(_.pick( decodedToken, ['name','email','_id','userRole']));
		const refreshedToken = user.generateAuthToken();
		//refresh the db record
		const session = await updateSession(token,refreshedToken);
		//control with the db record
		if (!session) return res.status(403).json({ message: 'Invalid token!'});
		//set the refreshedToken as a read-only cookie
		res.cookie('x-auth-token', refreshedToken, cookieSetting);
		next();
	} 
	catch (ex) {
		return res.status(403).json({ message: 'Invalid token!'});
	}
}

module.exports = auth;
