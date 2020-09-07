"use strict";
// For TOTP
const { authenticator } = require('otplib')

class Authenticator {
    static GetToken = (secret) => {
        return authenticator.generate(secret)
    }

    static GetTimeRemaining = () => {
        return authenticator.timeRemaining()
    }
    
    static IsValid = (token) => {
        return authenticator.check(token, secret)
    }
}

module.exports = Authenticator