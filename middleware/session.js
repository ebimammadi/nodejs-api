const jwt = require('jsonwebtoken');
const _ = require('lodash');

const { Session } = require('../models/session');

const createSession = async (sessionObj) => {
	if (!sessionObj.status) sessionObj.status = 'Logged-in';
	const session = new Session({
		user_id: sessionObj._id,
		email: sessionObj.email,
		token: sessionObj.token,
		status: sessionObj.status
	});
	
  try {
		await session.save();
	} catch(err) {
		return err;
	} 
}

const updateSession = async (oldToken,refreshedToken,status) => {
	try{
		let session = await Session.findOne({ token: oldToken });
		if (!session) return null;

		session.set({ token: refreshedToken, updatad_at: Date.now() });
		if (status) {
			session.set({ status: status });
			if (status == 'Signed-out') session.set({ isValid: false});
		}
		const result = await session.save();
		return result
	} catch(err){
		return err;
	}
}

exports.createSession = createSession;
exports.updateSession = updateSession;
