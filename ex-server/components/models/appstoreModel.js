"use strict";
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
}

// Export model
module.exports= appstoreModel;
