"use strict";
// Setting up config
const config = require('config');
// Setting up server dependencies
const database = require('./database')
const express = require('express')
const bodyParser = require('body-parser')


// Server setup
const server = express()
server.use(bodyParser.json())

//Import Routes after app due to @(app)
require('./routes/appstoreRoute')(server, database);

// App's port
const PORT = process.env.PORT || config.server.port
server.listen(PORT, () => { console.log(`[App] Running on port ${PORT}`) })
