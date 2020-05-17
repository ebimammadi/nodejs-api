const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token! Access denied.'});
    
    try{
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = decoded;
        next();
    } 
    catch (ex) {
        return res.status(400).json({ message: 'Invalid token!'});
    }
}

module.exports = auth