"use strict";
// Setting up config
const config = require('config');
const { v4: uuidv4 } = require('uuid');

// Setting up server dependencies
const connection = require('./components/database')

// Setting up express
const express = require('express')
const cors = require('cors')
const session = require('express-session')
const mysqlStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser')

// MySQL session storeage
const sessionStore =
   new mysqlStore({
      clearExpired: true,
      checkExpirationInterval: 900000,
      expiration: config.session.timeout,
      connectionLimit: 1,
      createDatabaseTable: true,
      charset: 'utf8mb4',
      schema: {
         tableName: 'lu_sessions',
         columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
         }
      }
   }, connection)

// Setup session
const sess = {
   key: config.session.key,
   secret: config.session.secret,
   resave: false,
   saveUninitialized: false,
   cookie: { maxAge: config.session.timeout },
   store: sessionStore,
   genid: () => { return uuidv4() }
}

// Server setup
const server = express()
//@todo: Need to add cors but ...
server.use(cors())
server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json())
server.use(session(sess))

// require routes
require('./components/routes/indexRoot')(server, connection, sessionStore);
require('./components/routes/appstoreRoute')(server, connection, sessionStore);
require('./components/routes/twofactorauthRoute')(server, connection, sessionStore);
require('./components/routes/loginRoute')(server, connection, sessionStore);

// App's port
const PORT = process.env.PORT || config.server.port
server.listen(PORT, () => { console.log(`[App] Running on port ${PORT}`) })
