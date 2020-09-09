"use strict";
class loginModel {
    // check if user exists
    static authenticate(connection, email, pin, result) {
        // Prepare query
        let strQuery = 'SELECT token, COUNT(*) as count FROM `ma_users` WHERE email = ? AND pin = ? LIMIT 1';

        connection.query(strQuery, [email, pin], (error, results) => {
            // Check for error
            if (error) {
                result(error, null)
                return
            }

            // Send:callback database results[0] (note: that [0] index should always be valid due to query)
            result(null, JSON.stringify(results[0]))
        })
    }
}

// Export model
module.exports= loginModel;
