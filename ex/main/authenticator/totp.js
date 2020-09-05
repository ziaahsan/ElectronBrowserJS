"use strict";
// Setting up configuration
const config = require('config');

// For TOTP
const { authenticator } = require('otplib')
const secret = config.otplib.github.ziaahsan

class Authenticator {
    static GetToken = () => {
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