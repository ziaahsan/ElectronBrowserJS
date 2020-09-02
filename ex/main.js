"use strict";
// Modules to control application life and create native browser window
const { app, ipcMain } = require('electron')
const requests = require('./main/window/requests')
const authenticator = require('./main/authenticator/totp')

// Setting up IPC
ipcMain.handle('add-requests', (event, data) => {
    event.data = data
    requests.fetch(event)
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
require('./main/window/create')(app)
