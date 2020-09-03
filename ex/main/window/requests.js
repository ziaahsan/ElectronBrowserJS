"use strict";
// Setup dev
const isDev = require('electron-is-dev')

// Cons for attaching icons
const getWindowsIcons = require('../icons/GetWindows')

// Setup c# connection
const conn = require('./connect')
conn.build()

// Valid requests from front-end
const validRequestTypes = ['select-programs', 'select-folders']

// Queue request, @todo: If there is another request of same type it's ignored.
let queuedRequests = []

// Simply adds icon to the data if it can
async function attachIconToResults(data) {
    return await new Promise((resolve, reject) => {
        data = JSON.parse(data)
        data.forEach(item => item = getWindowsIcons(item))
        resolve(data)
    })
}

//@todo: create all async tasks as try-catch
class Requests {
    static fetch = (event) => {
        if (event.data.type == null || event.data.type == undefined || !validRequestTypes.includes(event.data.type)) return

        // Already in queue
        if (queuedRequests[event.data.type]) return

        // Add it to queue
        queuedRequests[event.data.type] = event
        
        // Simply call and move on
        switch(event.data.type) {
            case validRequestTypes[0]:
                this.requestPrograms(event)
                break
            case validRequestTypes[1]:
                this.requestFolders(event)
                break
        }
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

        // Send data to front-end
        event.sender.send('add-request-response', event.data.type, data)

        // request completed remove it
        this.remove(event)
    }

    static requestFolders = async (event) => {
        // Setting up the c# request
        conn.send(event.data.type, event.data.q)

        let data = await conn.recievedFolders()
        data = await attachIconToResults(data)

        // Send data to front-end
        event.sender.send('add-request-response', event.data.type, data)

        // request completed remove it
        this.remove(event)
    }
}

module.exports = Requests