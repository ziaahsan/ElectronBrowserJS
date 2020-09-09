"use strict";
const config = require('config')
const HTTP_CODE = require('../codes')

// Setup dev para
const isDev = config.server.isDev

// setup appstore model
const appstoreModel = require('../models/appstoreModel')
const { check, validationResult } = require('express-validator')

module.exports = (server, connection, store) => {
    server.get(
        '/api/appstore',
        (req, res) => {
            // Construct the response default
            let response = {
                errors: null,
                code: 200,
                results: null
            }

            // Check if request is authentic
            store.get(req.sessionID, (error, session) => {
                if (!session || !session.email || !session.userID) {
                    response.errors = [ {message: HTTP_CODE['403']} ]
                    response.code = 403
                    
                    // Show the response
                    res.status(200).send(response)
                    return
                }

                appstoreModel.getAll(connection, (error, results) => {
                    // Setup error based on dev mode
                    if (error) {
                        response.errors = [ {message: HTTP_CODE['500']} ]
                        response.code = 500

                        if (isDev) {
                            response.errors = error
                        }

                        res.status(200).send(response)
                        return
                    }
                    
                    response.code = 200
                    response.results = JSON.parse(results)
    
                    // Show the response
                    res.status(200).send(response)
                })
            })
        }
    )
}
