"use strict";
// Setup path
const path = require('path')
// Modules to control application life and create native browser window
const { app, ipcMain, session } = require('electron')
// ContextMenu
const contextMenu = require('electron-context-menu')
contextMenu()
// Setup the browserWindows instance
const BrowserWindows = require('./components/window/browserWindows');
let browserWindows = new BrowserWindows()
// Setup ad-blocker
const { ElectronBlocker } = require('@cliqz/adblocker-electron')
const fetch = require('cross-fetch')
// Setup fs promises for ad-blocker caching
const fsPromises = require('fs').promises;

// Listeners
ipcMain.on('open-spotlight', (event, url) => browserWindows.loadSpotlight())
ipcMain.on('open-url', (event, url) => browserWindows.loadURL(url))
ipcMain.on('open-window', (event, windowId) => browserWindows.laodWindow(windowId))
ipcMain.on('open-blank-window', (event, url) => browserWindows.loadBlank())
ipcMain.on('open-previous-page', (event, windowId) => browserWindows.loadPreviousPage(windowId))
ipcMain.on('open-next-page', (event, windowId) => browserWindows.loadNextPage(windowId))
ipcMain.on('close-window', (event, windowId) => browserWindows.unloadWindow(windowId))

// When app's initialized
app.whenReady().then(async () => {
   // Electron ad-blocker
   ElectronBlocker.fromPrebuiltAdsAndTracking(fetch, {
      path: path.join(app.getPath('userData'), 'adblocker.bin'),
      read: fsPromises.readFile,
      write: fsPromises.writeFile,
   }).then((blocker) => {
      // Setup blocker for session
      blocker.enableBlockingInSession(session.defaultSession);
      // Setup windows
      browserWindows.createDefaultWindows()
   })
})
