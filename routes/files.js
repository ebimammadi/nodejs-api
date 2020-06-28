const express = require('express');
const router = express.Router(); 
const path = require('path');
const fs = require('fs');
const Joi = require('@hapi/joi');
const mime = require('mime');
const base64Img = require('base64-img');
const jwt = require ('jsonwebtoken');

const { User } = require('../models/user');
const auth = require('../middleware/auth');

//!file protections should be developed!!!


router.post('/upload-image', auth, async(req, res) => {
	const { error } = validateImage(req.body);
	if (error) return res.json({ response_type: 'error', message: `${error.details[0].message}` });
	try{
		//generate-folder
		const { _id } = jwt.verify( req.cookies["x-auth-token"], process.env.JWT_KEY);
		const folder = generateEncodedFolderName(req.body.usage, _id);
		//read record from database
		let user = await User.findOne({ _id });
		let profilePhotoUrl = user.profilePhotoUrl; 
		//remove previous file
		if (req.body.unique === 'true' && profilePhotoUrl ) await removeFromStorage(profilePhotoUrl);
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
		return res.json({ response_type: 'warning', message: err.message });
	}
});

router.get('/delete-image/:folder/:file', auth, async(req, res) => {
	//! 0.check credential
	try{
		//1. check folder validity & extract _id 
		const { usage, _id } = generateDecodedFolderName(req.params.folder);
		if (!validPrefixes.includes(usage)) return res.json({ response_type: 'danger', message: 'invalid path' });
		let user = await User.findOne({ _id });
		const profilePhotoUrl = '/' + req.params.folder + '/' + req.params.file;
			
		if (!user || (user.profilePhotoUrl != profilePhotoUrl) ) return res.json({ response_type: 'danger', message: 'invalid path' });
		//2. check if file exists
		const pathFile = absolutePath( profilePhotoUrl ) ;
		//3. delete file from server
		if (fs.existsSync(pathFile)) fs.unlinkSync(pathFile);
		//4. update filename
		user.set({ profilePhotoUrl: '' });
		await user.save();	
		//5. return
		return res.json({ response_type: 'success', url: profilePhotoUrl, message: 'removed successfully.' });
	}catch(err){
		return res.json({ response_type: 'danger', message: err.message });
	}

});

//!protected files 
router.get('/p/:folder/:file', auth, (req, res) => {
	const filename = absolutePath( '/p/' + req.params.folder + '/' + req.params.file);
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

//public files
router.get('/:folder/:file' , (req, res) => {
	const filename = absolutePath( '/' + req.params.folder + '/' + req.params.file);
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

const generateEncodedFolderName = (usage, _id) => {
	return Buffer.from(usage+'-'+_id).toString('hex') //!encode base64
	//revernse Buffer.from(hexEncoded, 'base64').toString()
};
const generateDecodedFolderName = (foldername) => {
	const [ usage, _id ] = Buffer.from(foldername, 'hex').toString().split('-');
	return { usage, _id };
}

const validateImage = (image) => {	
	const imageSchema = Joi.object({
		usage: Joi.string().required().valid('profile','product','point','reciept'),
		unique: Joi.string().valid('','true'),
		image: Joi.string().required()
	});
	return imageSchema.validate(image);
};

const absolutePath = pathFile => path.dirname(require.main.filename) + '/' + process.env.UPLOAD_FOLDER + pathFile;


const validPrefixes = ['profile','product','point','reciept'];

module.exports = router;
