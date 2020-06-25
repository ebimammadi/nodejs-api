//node_modules
const config = require('dotenv/config'); //to read .env file
const express = require('express');
const app = express();
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const Joi = require('joi');//!depricated, instead hapi/joi
// Joi.onjectId = require('joi-objectid')(Joi);

//customized_modules
const { responseHeaderConfig } = require('./middleware/headersCookie.js');

const homeRoutes = require('./routes/home');
const coursesRoutes = require('./routes/courses');
const usersRoute = require('./routes/users');
const fileRoutes = require('./routes/files');
//mongoose.connect('mongodb://localhost/playground')
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true } )
	.then( () => console.log('mongoDB connected ...'))
	.catch( (err) => console.error('Error connecting MongoDB... ',err));
mongoose.set('useCreateIndex', true);

//Middleware 
app.use( (req,res, next) => setTimeout(next, 500)); //adds 0.5 second of latency intentionally
app.use( helmet()); //! for security, it should be checked fully
app.use(cors({ credentials: true, origin: process.env.APP_PATH }));
app.use(responseHeaderConfig);//configures the header for requests
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb',extended: true }));
app.use(cookieParser());
//app.use(bodyParser.json({ limit: '50mb' }));//!important temporarily
//app.use(bodyParser.urlencoded({ limit: '50mb',extended: true }));
//app.use(express.urlencoded({ extended: true })); // key=value&key=value


//!BLOCK suspecious requests to the server by IP

//!Routes

app.use('/', homeRoutes);
app.use('/about', homeRoutes);
app.use('/courses', coursesRoutes);
app.use('/users', usersRoute);
app.use('/files', fileRoutes);
//Setting the port for the application
const port = process.env.PORT || 8080;
console.log('---------------------------------------------------------------')
app.listen(port,'localhost',() => console.log(`Listing on port ${port}...`) );
