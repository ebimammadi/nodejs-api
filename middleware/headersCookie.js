const responseHeaderConfig = function (req, res, next) {
	res.removeHeader("X-Powered-By");
	res.header("Access-Control-Expose-Headers", "x-auth-token");//, refresh-token, Set-Cookie");
	//res.header("Access-Control-Allow-Origin", "*");
	//res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
	//res.header("Access-Control-Expose-Headers", "");
	next();
}

const cookieSetting = { 
	maxAge: parseInt(parseFloat(process.env.JWT_EXP_HOUR)*3600*1000), 
	httpOnly: true 
};

module.exports = { responseHeaderConfig, cookieSetting };
