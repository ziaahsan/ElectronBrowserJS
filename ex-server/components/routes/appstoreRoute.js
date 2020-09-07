"use strict";
const config = require('config')
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
                    response.errors = "Authorization required!"
                    response.code = 403
                    
                    // Show the response
                    res.status(200).send(response)
                    return
                }

                appstoreModel.getAll(connection, (error, results) => {
                    // Setup error based on dev mode
                    if (error) {
                       response.errors = "An error occurred on our side."
                        response.code = 500
                        response.results = null

                        if (isDev) {
                            response.errors = error
                        }

                        res.status(200).send(response)
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
    
    // TwoFactorAuth Routes
    server.get(
        '/api/appstore/twofactorauth',
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
                    response.errors = "Authorization required!"
                    response.code = 403

                    // Show the response
                    res.status(200).send(response)
                    return
                }

                appstoreModel.getAllTwoFactorAuth(connection, session.userID, (error, results) => {
                    // Setup error based on dev mode
                    if (error) {
                        response.errors = "An error occurred on our side."
                        response.code = 500
                        response.results = null

                        if (isDev) {
                            response.errors = error
                        }

                        res.status(200).send(response)
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

    server.post(
        '/api/appstore/twofactorauth',
        [
            // Setup body checks
            check('token', "Invalid token.").isAlphanumeric().trim().escape().isLength(8).withMessage("Token length must be 8.")
        ],
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
                    response.errors = "Authorization required!"
                    response.code = 403

                    // Show the response
                    res.status(200).send(response)
                    return
                }

                // Check if request passed validation
                const errors = validationResult(req)
                
                // Send errors back
                if (!errors.isEmpty()) {
                    response.errors = errors.array(),
                    response.code = 400
                    response.results = null
                    
                    // Sending response
                    res.status(200).send(response)
                    return
                }

                let { token } = req.body

                appstoreModel.getTwoFactorAuthByToken(connection, session.userID, token, (error, results) => {
                    // Setup error based on dev mode
                    if (error) {
                        response.errors = "An error occurred on our side."
                        response.code = 500
                        response.results = null

                        if (isDev) {
                            response.errors = error
                        }

                        res.status(200).send(response)
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
