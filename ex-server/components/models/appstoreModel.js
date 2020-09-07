"use strict";
// Get authenticator
const authenticator = require('../authenticator/totp')

class appstoreModel {
    // Get all app store items at once
    static getAll(connection, result) {
        let strQuery = 'SELECT * FROM `ma_appstores`'
        connection.query(strQuery, (error, results) => {
            if (error) {
                result(error, null)
                return
            }

            result(null, JSON.stringify(results))
        })
    }

    // Get all twofactorauth
    static getAllTwoFactorAuth(connection, user_id, result) {
        let strQuery = 'SELECT * FROM `ma_twofactorauth` where user_id = ?'
        connection.query(strQuery, user_id, (error, results) => {
            if (error) {
                result(error, null)
                return
            }

            result(null, JSON.stringify(results))
        })
    }

    // Get all twofactorauth
    static getTwoFactorAuthByToken(connection, user_id, token, result) {
        let strQuery = 'SELECT * FROM `ma_twofactorauth` WHERE user_id = ? AND token = ? LIMIT 1'
        connection.query(strQuery, [user_id, token], async (error, results) => {
            if (error) {
                result(error, null)
                return
            }

            if (results[0] !== undefined) {
                results[0].secret = await new Promise(resolve => resolve(authenticator.GetToken(results[0].secret)))
                results[0].timeRemaining = await new Promise(resolve => resolve(authenticator.GetTimeRemaining()))
            }

            result(null, JSON.stringify(results))
        })
    }
}

// Export model
module.exports= appstoreModel;
