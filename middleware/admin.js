
const adminCheck = (req, res, next) => {
	//401 unauthorized no jwt
	//403 forbidden
	if(req.user.isAdmin) return res.status(403).json({ message: 'Access denied...'});

	next();
}

module.exports = adminCheck;
