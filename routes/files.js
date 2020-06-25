const express = require('express');
const router = express.Router(); 
const path = require('path');
const fs = require('fs');
const mime = require('mime');
const base64Img = require('base64-img');
const jwt = require ('jsonwebtoken');

const auth = require('../middleware/auth');
//! upload sample

router.post('/upload', (req, res) => {
	const token = req.cookies["x-auth-token"];
	const { _id } = jwt.verify(token, process.env.JWT_KEY);
	//const _id = new User(_.pick( decodedToken, ['name','email','_id','userRole']));
	const folder = process.env.UPLOAD_FOLDER + '/' + _id;
	const { image } = req.body;
	base64Img.img(image, folder, Date.now(), function(err, filepath){
		const pathArr = filepath.split('/');
		const filename = pathArr[pathArr.length-1];
		res.status(200).json({
			success: 'true',
			url: `http://localhost:8080/${filename}`
		})
	})
});
//!file protections should be developed!!!
//this part is for protected files 
router.get('/p/:folderName/:fileName', auth, (req, res) => {
	const filename = path.dirname(require.main.filename) + '/' + process.env.UPLOAD_FOLDER
								+ '/p/' + req.params.folderName + '/' + req.params.fileName;
	//!more authentication for protected files (own-user and admin only)
	try {   
		if (fs.existsSync(filename)) {     
			res.writeHead(200, {'Content-Type': mime.getType(filename)});      
			return res.end(fs.readFileSync(filename), 'binary');
		} 
		return res.send(`can't GET ${req.originalUrl}`);
	} catch(err) {   
		return res.send(`can't GET ${req.originalUrl}`);
	}
});

router.get('/:folderName/:fileName' , (req, res) => {
	const filename = path.dirname(require.main.filename) + '/' + process.env.UPLOAD_FOLDER
								+ '/' + req.params.folderName + '/' + req.params.fileName;
	try {   
		if (fs.existsSync(filename)) {     
			res.writeHead(200, {'Content-Type': mime.getType(filename)});      
			return res.end(fs.readFileSync(filename), 'binary');
		} 
		return res.send(`can't GET ${req.originalUrl}`);
	} catch(err) {   
		return res.send(`can't GET ${req.originalUrl}`);
	}
});

module.exports = router;
