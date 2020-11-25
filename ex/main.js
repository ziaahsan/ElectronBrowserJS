"use strict";
// Setup path
const path = require('path')
// Modules to control application life and create native browser window
const { app, ipcMain, session, protocol, nativeTheme } = require('electron')
// Setup the browserWindows instance
const BrowserWindows = require('./components/window/browserWindows');
let browserWindows = new BrowserWindows()
// Setup ad-blocker
const { ElectronBlocker } = require('@cliqz/adblocker-electron')
const fetch = require('cross-fetch')
// Setup fs promises for ad-blocker caching
const fsPromises = require('fs').promises;

// Setup native theme
nativeTheme.themeSource = 'dark'

// ENV Variabels
process.env['PROTOCOL_APP'] = 'app'
process.env['PROTOCOL_NODE'] = 'node'
process.env['WEBBAR_WINDOW_NAME'] = 'webbar'
process.env['WEBBAR_TOOLTIP_WINDOW_NAME'] = 'webbar-tooltip'

// Listeners
ipcMain.on('open-url', (event, url) => browserWindows.loadURL(url))
ipcMain.on('open-window', (event, windowId) => browserWindows.loadWindow(windowId))
ipcMain.on('open-blank-window', (event, url) => browserWindows.loadBlank())
ipcMain.on('open-previous-page', (event, windowId) => browserWindows.loadPreviousPage(windowId))
ipcMain.on('open-next-page', (event, windowId) => browserWindows.loadNextPage(windowId))
ipcMain.on('close-window', (event, windowId) => browserWindows.unloadWindow(windowId))
ipcMain.on('find-in-focused-page', (event, searchTerm) => browserWindows.findInFocusedPage(searchTerm))
ipcMain.on('stop-find-in-focused-page', (event, searchTerm) => browserWindows.stopFindInFocusedPage(searchTerm))

// Protocol
protocol.registerSchemesAsPrivileged([
   {
      scheme: process.env['PROTOCOL_APP'],
      privileges: { standard: false, secure: true, allowServiceWorkers: true, supportFetchAPI: true, corsEnabled: true }
   },
   {
      scheme: process.env['PROTOCOL_NODE'],
      privileges: { standard: false, secure: true, corsEnabled: true }
   }
])

app.on('ready', async () => {
   app.userAgentFallback = app.userAgentFallback
      // SingleBox: Fix WhatsApp requires Google Chrome 49+ bug
      // App Name doesn't have white space in user agent. 'Google Chat' app > GoogleChat/8.1.1
      .replace(` ${app.name.replace(/ /g, '')}/${app.getVersion()}`, '')
      // Hide Electron from UA to improve compatibility
      // https://github.com/atomery/webcatalog/issues/182
      .replace(` Electron/${process.versions.electron}`, '')

   // SingleBox: Fix Google prevents signing in because of security concerns
   session.defaultSession.webRequest.onBeforeSendHeaders({
      urls: ['https://*.google.com/*']
   }, (details, callback) => {
      details.requestHeaders['User-Agent'] = `${app.userAgentFallback} Edge/18.18875`
      callback({ requestHeaders: details.requestHeaders })
   })
})

app.whenReady().then(() => {
   // Register app:// protocol
   protocol.registerFileProtocol(process.env['PROTOCOL_APP'], (request, callback) => {
      let protocolName = `${process.env['PROTOCOL_APP']}://`
      let url = request.url.substr(protocolName.length).replace(/\/+$/, "")
      // Issue #15: Hash-bang prefix
      url = url.replace('#!', "")
      callback({ path: path.normalize(`${__dirname}/public/${url}`) })
   })

   // Register node:// protocol
   protocol.registerFileProtocol(process.env['PROTOCOL_NODE'], (request, callback) => {
      let protocolName = `${process.env['PROTOCOL_NODE']}://`
      let url = request.url.substr(protocolName.length).replace(/\/+$/, "")
      // Issue #15: Hash-bang prefix
      url = url.replace('#!', "")
      callback({ path: path.normalize(`${__dirname}/node_modules/${url}`) })
   })

   // Electron ad-blocker
   ElectronBlocker.fromPrebuiltAdsAndTracking(fetch, {
      path: path.join(app.getPath('userData'), 'adblocker.bin'),
      read: fsPromises.readFile,
      write: fsPromises.writeFile,
   }).then((blocker) => {
      // Setup blocker for session
      blocker.enableBlockingInSession(session.defaultSession)
      // Setup windows
      browserWindows.createDefaultWindows()
   })
})
