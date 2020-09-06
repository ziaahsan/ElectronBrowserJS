"use strict";
// Setting up dev
const isDev = require('electron-is-dev')
// setup appstore model
const appstoreModel = require('../models/appstoreModel');

module.exports = (server, database) => {
    server.get('/api/appstore', (req, res) => {
        appstoreModel.getAll(database, (error, results) => {
            // Construct the response default
            let response = {
                error: null,
                code: 200,
                results: null
            }

            // Setup error based on dev mode
            if (error) {
                if (isDev) {
                    response.error = error
                    response.code = 500
                    response.results = null

                    res.status(500).send(response)
                } else {
                    response.error = "An error on our side"
                    response.code = 500
                    response.results = null

                    res.status(500).send(response)
                }
                return
            }
            
            // Response data if !error
            response.error = error
            response.code = 200
            response.results = JSON.parse(results)

            // Show the response
            res.status(200).send(response)
        })
    })
}
