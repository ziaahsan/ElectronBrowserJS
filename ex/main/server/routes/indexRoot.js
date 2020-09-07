"use strict";
// Setting up dev
const isDev = require('electron-is-dev')

module.exports = (server, connection, store) => {
    // Default root construct a session
    server.get('/api', (req, res, next) => {
        // Construct the response default
        let response = {
            errors: null,
            code: 200,
            results: null
        }

        // Show the response
        res.status(200).send(response)
    })
}