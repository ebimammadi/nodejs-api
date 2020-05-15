const config =require('dotenv/config'); //to read .env file e.g process.env.DB_CONNECT
const Joi = require('joi');
Joi.onjectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const coursesRoute = require('./routes/courses');
const usersRoute = require('./routes/users');
const authRoute = require('./routes/auth');

const express = require('express');
const app = express();

const cors = require('cors');



mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true } )
    .then( () => console.log('mongoDB connected ...'))
    .catch( (err) => console.log('Error connecting MongoDB... ',err));
mongoose.set('useCreateIndex', true);



//const bodyParser = require('body-parser');

//Middlewares
app.use(express.json()); //it's a middleware which parses the incoming JSON payload based on body-parser
app.use(express.urlencoded({ extended: true })); // key=value&key=value
//app.use(bodyParser.json());
app.use(cors());


//Routes
app.get('/', (req,res)=>{
    res.json({message:'What are you looking for!'});
});
app.use('/courses', coursesRoute);
app.use('/users', usersRoute);
app.use('/auth', authRoute);

const port = process.env.PORT || 3000;
app.listen(port,'localhost',() => console.log(`Listing on port ${port}...`) );
