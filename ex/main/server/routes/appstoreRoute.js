"use strict";
// Setting up dev
const isDev = require('electron-is-dev')
// setup appstore model
const appstoreModel = require('../models/appstoreModel');

module.exports = (server, connection, store) => {
    server.get(
        '/api/appstore',
        (req, res) => {
            console.log(req.get('host'))
            console.log(req.get('origin'))
            // Construct the response default
            let response = {
                errors: null,
                code: 200,
                results: null
            }

            // Check if request is authentic
            store.get(req.sessionID, (error, session) => {
                if (!session || !session.email) {
                    response.errors = "Authorization required!"
                    response.code = 403
                    response.results = null
                    
                    // Show the response
                    res.status(200).send(response)
                    return
                }

                appstoreModel.getAll(connection, (error, results) => {
                    // Setup error based on dev mode
                    if (error) {
                        if (isDev) {
                            response.errors = error
                            response.code = 500
                            response.results = null
    
                            res.status(500).send(response)
                        } else {
                            response.errors = "An error occurred on our side."
                            response.code = 500
                            response.results = null
    
                            res.status(200).send(response)
                        }
                        return
                    }
                    
                    // Response data if !error
                    response.errors = error
                    response.code = 200
                    response.results = JSON.parse(results)
    
                    // Show the response
                    res.status(200).send(response)
                })
            })
        }
    )
}
