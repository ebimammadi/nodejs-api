//node_modules
const config = require('dotenv/config'); //to read .env file
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// const Joi = require('joi');//!depricated
// Joi.onjectId = require('joi-objectid')(Joi);

//customized_modules
const homeRoutes = require('./routes/home');
const coursesRoutes = require('./routes/courses');
const usersRoute = require('./routes/users');
//const authRoute = require('./routes/auth');

if (!process.env.JWT_KEY) {
	console.error('Fatal Error: jwtPrivateKey is not defined.');
	process.exit(1);
}

//mongoose.connect('mongodb://localhost/playground')
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true } )
	.then( () => console.log('mongoDB connected ...'))
	.catch( (err) => console.log('Error connecting MongoDB... ',err));
mongoose.set('useCreateIndex', true);

//Middleware 
//adds 2 seconds of intentional latency
//app.use( (req,res, next) => setTimeout(next, 500))
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // key=value&key=value
app.use(cors());

//!Routes
app.use('/', homeRoutes);
app.use('/validate', homeRoutes);
app.use('/courses', coursesRoutes);
app.use('/users', usersRoute);
//app.get('/auth', authRoute);

const port = process.env.PORT || 8080;
app.listen(port,'localhost',() => console.log(`Listing on port ${port}...`) );
