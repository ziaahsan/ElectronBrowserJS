"use strict";
class loginModel {
    // check if user exists
    static authenticate(connection, email, pin, result) {
        // Prepare query
        let strQuery = 'SELECT COUNT(*) as count FROM `ma_users` WHERE email = ? AND pin = ?';

        connection.query(strQuery, [email, pin], (error, results) => {
            // Check for error
            if (error) {
                result(error, null)
                return
            }

            // Send database results
            result(null, JSON.stringify(results[0]))
        })
    }
}

// Export model
module.exports= loginModel;
