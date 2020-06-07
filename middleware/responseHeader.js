const responseHeaderConfig = function (req, res, next) {
	//res.header("Access-Control-Allow-Origin", "*");
	//res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
	res.header("Access-Control-Expose-Headers", "x-auth-token, refresh-token");
	//res.header("Access-Control-Expose-Headers", "");
	next();
}

module.exports = responseHeaderConfig;
