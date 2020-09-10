"use strict";
// Setting up configuration
const config = require('config');
// Setting up mysql
const mysql = require('mysql')

// Database connection
const database = mysql.createConnection({
   host: config.mysql.host,
   user: config.mysql.user,
   password: config.mysql.password,
   database: config.mysql.database,
   charset: config.mysql.charset
})

// Connecting to database
database.connect((error) => {
   if (error) throw error
   console.log("[App] MySQL Database Connected")
});

// Expor database
module.exports = database