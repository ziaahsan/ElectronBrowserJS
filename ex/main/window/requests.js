const isDev = require('electron-is-dev')
const getWindowsIcons = require('../icons/GetWindows')

// Setup c# connection
const conn = require('./connect')
conn.build()

// Valid requests from front-end
const validRequestTypes = ['select-programs', 'select-folders']


// Simply adds icon to the data it it can
async function attachIconToResults(data) {
    return await new Promise((resolve, reject) => {
        data = JSON.parse(data)
        data.forEach(item => item = getWindowsIcons(item))
        resolve(data)
    })
}

let queuedRequests = []

class Requests {
    static fetch = async (event) => {
        let valid = true

        if (event.source != window) valid = false
        if (event.data.type == null || event.data.type == undefined || !validRequestTypes.includes(event.data.type)) valid = false
        if (queuedRequests[event.data.type]) valid = false

        if (!valid) return;

        // add it to the list
        queuedRequests[event.data.type] = event
        
        await new Promise((resolve, reject) => {
            switch(event.data.type) {
                case validRequestTypes[0]:
                   this.requestPrograms(event)
                   break
                case validRequestTypes[1]:
                    this.requestFolders(event)
                    break
            }
        })
    }

    static remove = (event) => {
        if (queuedRequests[event.data.type])
            delete queuedRequests[event.data.type]
    }

    static requestPrograms = async (event) => {
        // Setting up the c# request
        conn.send(event.data.type, event.data.q)
        let data = await conn.recievedPrograms()
        data = await attachIconToResults(data)

        // request completed remove it
        this.remove(event)

        // Send data to front-end
        window.postMessage({type: "NG_REQUEST", name:event.data.type, results:data})
    }

    static requestFolders = async (event) => {
        // Setting up the c# request
        conn.send(event.data.type, event.data.q)
        let data = await conn.recievedFolders()
        data = await attachIconToResults(data)
        
        // request completed remove it
        this.remove(event)

        // Send data to front-end
        window.postMessage({type: "NG_REQUEST", name:event.data.type, results:data})
    }
}

module.exports = Requests