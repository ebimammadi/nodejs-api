const jwt = require('jsonwebtoken');
const _ = require('lodash');

const { Session } = require('../models/session');

const createSession = async (user) => {
	console.log(`here it is in createSession`)
	if (!user.status) user.status = 'logged'
	const session = new Session({
		user_id: user._id,
		email: user.email,
		token: user.token,
		status: user.status
  });
  try {
		await session.save();
		console.log(`here it is logged`)
	} catch(err) {
		return err;
	} 
}

const updateSession = async (oldToken,refreshedToken,status) => {
	try{
		let session = await Session.findOne({ token: oldToken });
		if (!session) throw `invalid token!`;
		session.set({token: refreshedToken });
		if (status) session.set({ status: status });
		await session.save();
	} catch(err){
		return err;
	}
}

module.exports = createSession;
module.exports = updateSession;