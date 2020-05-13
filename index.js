const express = require('express');
const app = express();

const port = process.env.PORT || 3000;
app.listen(port,() => console.log(`Listing on port ${port}...`) );

require('dotenv/config'); //to read .env file e.g process.env.DB_CONNECT
const mongoose = require('mongoose');
const cors = require('cors');

//Middlewares
app.use(cors());

//Routes
app.get('/', (req,res)=>{
    res.send('We are on home')
});

mongoose.connect(process.env.DB_CONNECT,
    { useNewUrlParser: true, useUnifiedTopology: true } )
    .then( () => console.log('mongoDB connected ...'))
    .catch( (err) => console.log('Error connecting MongoDB... ',err));

    