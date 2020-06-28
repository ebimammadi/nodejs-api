//node_modules
const config = require('dotenv/config'); //to read .env file
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const port = process.env.PORT || 8080; //!application port

//customized_modules
const { responseHeaderConfig } = require('./middleware/headersCookie.js');

const homeRoutes = require('./routes/home');
const coursesRoutes = require('./routes/courses');
const usersRoute = require('./routes/users');
const fileRoutes = require('./routes/files');

mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true } )
	.then( () => console.log('mongoDB connected ...'))
	.catch( (err) => console.error('Error connecting MongoDB... ',err));
mongoose.set('useCreateIndex', true);

//Middleware 
//app.use( (req,res, next) => setTimeout(next, 500)); //adds 0.5 second of latency intentionally
app.use(helmet()); //! for security issues, it should be developed
app.use(cors({ credentials: true, origin: process.env.APP_PATH }));
app.use(express.json({ limit: '16mb' }));
app.use(express.urlencoded({ limit: '16mb',extended: true }));
app.use(cookieParser());
app.use(responseHeaderConfig);//configures the header for requests

//!DO BLOCK suspecious requests to the server by IP

//Routes
app.use('/', homeRoutes);
app.use('/about', homeRoutes);
app.use('/courses', coursesRoutes);
app.use('/users', usersRoute);
app.use('/files', fileRoutes);

app.listen(port,'localhost',() => console.log(`Listing on port ${port}...`) );
