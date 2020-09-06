"use strict";
class appstoreModel {
    // Get all app store items at once
    static getAll(database, result) {
        database.query("SELECT * FROM `ma_appstores`", (error, results) => {
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
