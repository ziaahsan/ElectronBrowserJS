"use strict";
const config = require('config')
// Setting up dev
const isDev = config.server.isDev

// setup login model
const loginModel = require('../models/loginModel')
const { check, validationResult } = require('express-validator')

module.exports = (server, connection, store) => {
    server.get('/api/login', (req, res) => {
        // Construct the response default
        let response = {
            errors: null,
            code: 200,
            results: null
        }

        // Check if request is authentic
        store.get(req.sessionID, (error, session) => {
            // Check if request.session doesnt have an email
            if (session && session.email && session.userID) {
                // Sending response
                res.status(200).send(response)
                return
            }
            
            response.errors = "Not logged in."
            response.code = 403
            response.results = null
            
            // Sending response
            res.status(200).send(response)
            return
        })
    })

    server.post(
        '/api/login',
        [
            // Setup body checks
            check('email', "Invalid email.").isEmail().normalizeEmail(),
            check('pin', "Invalid pin.").isAlphanumeric().trim().escape().isLength(4).withMessage("Pin length must be 4.")
        ],
        (req, res, next) => {
            // Construct the response default
            let response = {
                errors: null,
                code: 200,
                results: null
            }

            // Check if request is authentic
            store.get(req.sessionID, (error, session) => {
                // Check if request.session doesnt have an email
                if (session && session.email && session.userID) {
                    response.errors = "Already logged in!"
                    
                    // Sending response
                    res.status(200).send(response)
                    return
                }

                // Check if request passed validation
                const errors = validationResult(req)
                
                // Send errors back
                if (!errors.isEmpty()) {
                    response.errors = errors.array()
                    response.code = 400
                    response.results = null
                    
                    // Sending response
                    res.status(200).send(response)
                    return
                }

                // Setup email and pin after validation
                let {email, pin} = req.body

                // Request login model to authentcate params
                loginModel.authenticate(connection, email, pin, (error, results) => {
                    // Setup error based on dev mode
                    if (error) {
                        if (isDev) {
                            response.errors = error
                            response.code = 500
                            response.results = null

                            res.status(500).send(response)
                        } else {
                            response.errors = "An error on our side"
                            response.code = 500
                            response.results = null

                            res.status(200).send(response)
                        }
                        return
                    }

                    // Get the result from string to json and check for count
                    let jsonResults = JSON.parse(results)
                    let count = jsonResults.count

                    // Save session
                    if (count == 1) {
                        response.code = 200
                        req.session.userID = jsonResults.id
                        req.session.email = email
                        store.set(req.sessionID, req.session, (error) => {
                            if (error) {
                                //@todo: Send error to devlog
                                return
                            }
                        })
                    } else {
                        response.code = 400
                    }

                    // Response data if !error
                    response.errors = error
                    response.results = jsonResults

                    // Show the response
                    res.status(200).send(response)
                })
            })
        }
    )
}
