//node_modules
const config = require('dotenv/config'); //to read .env file
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const Joi = require('joi');//!depricated, instead hapi/joi
// Joi.onjectId = require('joi-objectid')(Joi);

//customized_modules
const configResponseHeader = require('./middleware/responseHeader');

const homeRoutes = require('./routes/home');
const coursesRoutes = require('./routes/courses');
const usersRoute = require('./routes/users');

//mongoose.connect('mongodb://localhost/playground')
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true } )
	.then( () => console.log('mongoDB connected ...'))
	.catch( (err) => console.error('Error connecting MongoDB... ',err));
mongoose.set('useCreateIndex', true);

//Middleware 
app.use( (req,res, next) => setTimeout(next, 500)); //adds 0.5 seconds of intentional latency
app.use(configResponseHeader);
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // key=value&key=value
app.use(cors());

//!Routes
app.use('/', homeRoutes);
app.use('/validate', homeRoutes);
app.use('/courses', coursesRoutes);
app.use('/users', usersRoute);

//Setting the port for the application
const port = process.env.PORT || 8080;
app.listen(port,'localhost',() => console.log(`Listing on port ${port}...`) );
