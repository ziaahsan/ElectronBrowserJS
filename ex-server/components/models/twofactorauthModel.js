"use strict";
// Generate token use
const crypto = require('crypto-random-string')

// Get authenticator
const authenticator = require('../authenticator/totp')

class twofactorauthModel {
   // StoreModel contructor
   constructor(auth) {
      // This object
      this.token = crypto({ length: 8, type: 'url-safe' })
      this.user = auth.user
      this.title = auth.title
      this.command = auth.command
      this.description = auth.description
      this.type = auth.type
      this.secret = auth.secret
      this.relative_link = auth.relative_link + '/' + this.token
   }

   // Get all twofactorauth
   static getAllTwoFactorAuth(connection, userToken, result) {
      let strQuery = 'SELECT * FROM `ma_twofactorauth` where user = ?'
      connection.query(strQuery, userToken, (error, results) => {
         if (error) {
            result(error, null)
            return
         }

         result(null, JSON.stringify(results))
      })
   }

   // Get all twofactorauth
   static getTwoFactorAuthByToken(connection, userToken, token, result) {
      let strQuery = 'SELECT * FROM `ma_twofactorauth` WHERE user = ? AND token = ? LIMIT 1'
      connection.query(strQuery, [userToken, token], async (error, results) => {
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

   // Create a new auth
   static create(connection, newauth, result) {
      let strQuery = 'INSERT INTO `ma_twofactorauth` SET ?'
      connection.query(strQuery, newauth, (error, results) => {
         if (error) {
            result(error, null);
            return;
         }

         result(null, JSON.stringify(results))
      });
   }

   static remove(connection, userToken, token, result) {
      let strQuery = 'DELETE FROM `ma_twofactorauth` WHERE user = ? AND token = ?'
      connection.query(strQuery, [userToken, token], (error, results) => {
         if (error) {
            result(error, null);
            return;
         }

         result(null, JSON.stringify(results))
      });
   }
}

// Export model
module.exports = twofactorauthModel;