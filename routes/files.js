const express = require('express');
const router = express.Router(); 
const path = require('path');
const fs = require('fs');
const Joi = require('@hapi/joi');
const mime = require('mime');
const base64Img = require('base64-img');
const jwt = require ('jsonwebtoken');
const sha256 = require('js-sha256');

const auth = require('../middleware/auth');

router.post('/upload-image', auth, (req, res) => {
	const { error } = validateImage(req.body);
	if (error) return res.json( { response_type: 'error', message: `${error.details[0].message}`} );
	
	const { _id } = jwt.verify( req.cookies["x-auth-token"], process.env.JWT_KEY);
	const hashedFolderName = sha256(_id);
	const localFolderName = process.env.UPLOAD_FOLDER + '/' + hashedFolderName;
	const localFileName = `${req.body.usage}-${Date.now()}`;
	
	//! const unique = req.body.unique; check if the 

	const { image } = req.body;
	base64Img.img(image, localFolderName, localFileName, function(err, filepath){
		const pathArr = filepath.split('/');
		const fileName = pathArr[pathArr.length-1];
		res.status(200).json({
			success: 'true',
			url: `${process.env.API_PATH}/files/${hashedFolderName}/${fileName}`
		})
})
});

const validateImage = (image) => {	
	const imageSchema = Joi.object({
		usage: Joi.string().required().valid('profile','product','point','reciept'),
		unique: Joi.string().valid('','true'),
		image: Joi.string().required()
	});
	return imageSchema.validate(image);
}

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
