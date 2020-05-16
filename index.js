const config =require('dotenv/config'); //to read .env file e.g process.env.DB_CONNECT
const Joi = require('joi');
Joi.onjectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
//customized_modules
const homeRoute = require('./routes/home');
const coursesRoute = require('./routes/courses');
const usersRoute = require('./routes/users');
const authRoute = require('./routes/auth');
//node_modules
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

if (!process.env.JWT_PRIVATE_KEY) {
    console.error('Fatal Error: jwtPrivateKey is not defined.');
    process.exit(1);
    
}
//mongoose connect
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true } )
    .then( () => console.log('mongoDB connected ...'))
    .catch( (err) => console.log('Error connecting MongoDB... ',err));
mongoose.set('useCreateIndex', true);

//Middlewares
app.use(bodyParser.json());
app.use(express.json()); //it's a middleware which parses the incoming JSON payload based on body-parser

app.use(express.urlencoded({ extended: true })); // key=value&key=value

app.use(cors());

//Routes
app.get('/', homeRoute);
app.use('/courses', coursesRoute);
app.use('/users', usersRoute);
app.use('/auth', authRoute);

const port = process.env.PORT || 8080;
app.listen(port,'localhost',() => console.log(`Listing on port ${port}...`) );
