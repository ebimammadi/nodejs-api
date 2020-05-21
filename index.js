const config =require('dotenv/config'); //to read .env file
const Joi = require('@hapi/joi');
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

if (!process.env.JWT_KEY) {
    console.error('Fatal Error: jwtPrivateKey is not defined.');
    process.exit(1);

}
//mongoose connect
//mongoose.connect('mongodb://localhost/playground', { useNewUrlParser: true, useUnifiedTopology: true } )
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true } )
    .then( () => console.log('mongoDB connected ...'))
    .catch( (err) => console.log('Error connecting MongoDB... ',err));
mongoose.set('useCreateIndex', true);
//mongoose.set('autoCreate', true);

//Middleware 
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // key=value&key=value

app.use(cors());

//Routes
app.get('/', homeRoute);
app.get('/validate', homeRoute);
app.use('/courses', coursesRoute);
app.use('/users', usersRoute);
app.use('/auth', authRoute);

const port = process.env.PORT || 8080;
app.listen(port,'localhost',() => console.log(`Listing on port ${port}...`) );
