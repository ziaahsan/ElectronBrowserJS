"use strict";
// Modules to control application life and create native browser window
const { app } = require('electron')
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
require('./main/window/create')(app)