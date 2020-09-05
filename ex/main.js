"use strict";
// Modules to control application life and create native browser window
const { app, ipcMain } = require('electron')
const requests = require('./main/window/requests')
const authenticator = require('./main/authenticator/totp')

// Setting up IPC
ipcMain.handle('ng-requests', async (event, data) => {
    if (!data.type) return
    // We're adding data to the reqeust
    // because in the requests.fetch we want to event.sender.send
    switch(data.type)  {
        case 'get-token':
            let token = await new Promise(resolve => resolve(authenticator.GetToken()))
            let timeRemaining = await new Promise(resolve => resolve(authenticator.GetTimeRemaining()));
            event.sender.send('request-response', 'ng-twofactorauth', data.type, {token: token, timeRemaining: timeRemaining})
            break
        case 'select-programs':
        case 'select-folders':
            event.data = data
            requests.fetch(event)
            break
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
require('./main/window/create')(app)
