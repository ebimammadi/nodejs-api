const express = require('express');
const router = express.Router(); 
const path = require('path');
const fs = require('fs');
const Joi = require('@hapi/joi');
const mime = require('mime');
const base64Img = require('base64-img');
const jwt = require ('jsonwebtoken');
const sha256 = require('js-sha256');
//const _ = require('lodash'); 

const { User } = require('../models/user');
const auth = require('../middleware/auth');

router.post('/upload-image', auth, async(req, res) => {
	const { error } = validateImage(req.body);
	if (error) return res.json({ response_type: 'error', message: `${error.details[0].message}` });
	//generate-folder
	try{
		const token = jwt.verify( req.cookies["x-auth-token"], process.env.JWT_KEY);
		const folder = generateFolderName(req.body.usage, token);
		//read record from database
		let user = await User.findOne({ _id: token._id });
		let profilePhotoUrl = user.profilePhotoUrl; 
		//remove previous file
		if (req.body.unique === 'true') {
			console.log(`remove from storage`)
			if (profilePhotoUrl) await removeFromStorage(profilePhotoUrl);
		}
		//upload to storage
		const uploadPath = await uploadToStorage( req.body.image, req.body.usage, folder);
		//save to database
		user.set({ profilePhotoUrl: uploadPath });
		await user.save();
		//return the result
		res.status(200).json({
			success: 'true',
			url: `${process.env.API_PATH}/files${uploadPath}`
		});
	}catch(err){
		return res.json({ response_type: 'error', message: `error!` });
	}

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

const removeFromStorage = (file) => {
	const path = process.env.UPLOAD_FOLDER + file;
	return new Promise ( (resolve, reject) => {
		try {
			if (fs.existsSync(path)) fs.unlinkSync(path);
			else console.error(`file ${path} does not exist`)
			resolve('deleted');
		} catch(err) {
			console.error(err);
			reject(err);
		}	
	});
};

const uploadToStorage = (image, usage, folder) => {
	const folderName = process.env.UPLOAD_FOLDER + '/' + folder;
	const fileName = `${usage}-${Date.now()}`;
	return new Promise( (resolve,reject) => {
		base64Img.img(image, folderName, fileName, function(err, filepath){
			const pathArr = filepath.split('/');
			const savedFileName = pathArr[pathArr.length-1];
			resolve(`/${folder}/${savedFileName}`);
		});
	})
};

const generateFolderName = (usage, token) => {
	//usage `profile`
	return `${usage}-${sha256(token._id)}`;
};

const validateImage = (image) => {	
	const imageSchema = Joi.object({
		usage: Joi.string().required().valid('profile','product','point','reciept'),
		unique: Joi.string().valid('','true'),
		image: Joi.string().required()
	});
	return imageSchema.validate(image);
};

module.exports = router;
