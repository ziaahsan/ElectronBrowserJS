// Generate token use
const crypto = require('crypto-random-string')
// Setup is dev
const isDev = require('electron-is-dev')
// Eelectron storage
const electronStore = require('electron-store');
const savedTabStorage = new electronStore({accessPropertiesByDotNotation: false, name: 'SavedTabs'});

// Setup consts for window
const { BrowserWindow } = require('glasstron')
// Path config abs
const path = require('path')

class CustomBrowserWindow {
   constructor(id, url, options) {
      this.id = id
      this.url = url
      this.options = options
      this.browserWindow = new BrowserWindow({
         show: false,

         backgroundColor: this.options.backgroundColor,

         frame: this.options.frame,
         parent: this.options.parentBrowserWindow,

         transparent: this.options.transparent,

         focusable: this.options.focusable,
         closable: this.options.closable,
         maximizable: this.maximizable,
         resizable: this.options.resizable,

         center: this.options.center,
         width: this.options.width,
         height: this.options.height,

         blur: this.options.blur,
         blurType: "blurbehind",
         vibrancy: "fullscreen-ui",

         hasShadow: this.options.shadow,

         webPreferences: {
            sandbox: true,
            worldSafeExecuteJavaScript: true,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
         }
      })
   }

   getBrowserWindow = function () {
      return this.browserWindow
   }

   create = async function () {
      if (this.options.position !== null)
         this.browserWindow.setPosition(this.options.position.x, this.options.position.y)

      // Events Must be initialized before the load
      // Setup readyToShow
      this.browserWindow.once('ready-to-show', this._readyToShowListener)

      // Wait for url to load
      if (this.url.startsWith('http')) {
         await this.browserWindow.loadURL(this.url)
      } else {
         await this.browserWindow.loadFile(this.url)
      }
   }

   _readyToShowListener = function () {
      if (isDev) this.browserWindow.webContents.openDevTools()

      this.browserWindow.show()
      this.browserWindow.focus()

      this.browserWindow.tabId = this.id
      this.browserWindow.created = new Date()
   }.bind(this) // Add the scope of the class to function
}

module.exports = class BrowserWindows {
   constructor() {
      this.parentWindow = null
      this.webbarWindow = null
      this.spotlightWindow = null

      this.spinnerURL = 'icons/spinner.gif'
   }

   getFocusedBrowserWindow = function () {
      return BrowserWindow.getFocusedWindow()
   }

   setupInitialBrowserWindows = function () {
      let id = 'parent'
      let url = 'public/blank.html'
      let options = {
         backgroundColor: '#ffffff',
         frame: true,
         transparent: false,

         focusable: true,
         closable: true,
         maximizable: true,
         resizable: false,

         width: 1366,
         height: 768,

         blur: false,

         center: true,
         parentBrowserWindow: null,
         position: null,

         shadow: true
      }

      this.parentWindow = new CustomBrowserWindow(id, url, options)
      this.parentWindow.create()

      // Automatically setup child webbarwindow, and spotlight
      this.setupWebbarBrowserWindow()
      this.setupSpotlightBrowserWindow()
   }

   setupWebbarBrowserWindow = async function () {
      if (this.parentWindow === null)
         throw "Parent window is mssing!"

      let parentWidnowContext = this.parentWindow.getBrowserWindow()
      let parentPosition = parentWidnowContext.getPosition()

      let id = 'webbar'
      let url = 'public/webbar.html'
      let options = {
         backgroundColor: '#ffffff',
         frame: false,
         transparent: false,

         focusable: false,
         closable: false,
         maximizable: true,
         resizable: false,

         width: 1366,
         height: 42,

         blur: false,

         center: false,
         parentBrowserWindow: parentWidnowContext,
         position: { x: parentPosition[0], y: parentPosition[1] },

         shadow: false
      }

      this.webbarWindow = new CustomBrowserWindow(id, url, options)
      this.webbarWindow.create()

      this.webbarWindow.getBrowserWindow().on('show', function () {
         this.restoreButDontOpenTabs()
      }.bind(this))
   }

   setupSpotlightBrowserWindow = function () {
      if (this.parentWindow === null)
         throw "Parent window is mssing!"

      let parentWidnowContext = this.parentWindow.getBrowserWindow()
      let parentPosition = parentWidnowContext.getPosition()

      let id = 'spotlight'
      let url = 'public/index.html'
      let options = {
         backgroundColor: '#000000000',
         frame: false,
         transparent: true,

         focusable: true,
         closable: true,
         maximizable: true,
         resizable: false,

         width: 1366,
         height: 726,

         blur: true,

         center: false,
         parentBrowserWindow: parentWidnowContext,
         position: { x: parentPosition[0], y: parentPosition[1] + 42 },

         shadow: false
      }

      this.spotlightWindow = new CustomBrowserWindow(id, url, options)
      this.spotlightWindow.create()
   }

   setupChildBrowserWindow = function (token, urlString) {
      if (this.parentWindow === null)
         throw "Parent window is mssing!"

      let parentWidnowContext = this.parentWindow.getBrowserWindow()
      let parentPosition = parentWidnowContext.getPosition()

      let id = token
      let url = urlString
      let options = {
         backgroundColor: '#ffffff',
         frame: false,
         transparent: false,

         focusable: true,
         closable: true,
         maximizable: true,
         resizable: false,

         width: 1366,
         height: 726,

         blur: false,

         center: false,
         parentBrowserWindow: parentWidnowContext,
         position: { x: parentPosition[0], y: parentPosition[1] + 42 },

         shadow: false
      }

      return new CustomBrowserWindow(id, url, options)
   }

   createTab = function (urlString, token='') {
      if (token.length != 8)
         token = crypto({ length: 8, type: 'alphanumeric' })
      
      let tabInfo = {
         tabId: token,
         isLoading: true,
         favIcon: '',
         title: 'Untitled'
      }

      // Send the tab to be created with its info
      this.sendWebbar('create-tab', tabInfo)

      // Custom browserwindow
      let customBrowserWindow = this.setupChildBrowserWindow(token, urlString)

      // Attach events
      this.attachEventsToBrowserWindow(customBrowserWindow, tabInfo)

      // Create the window
      customBrowserWindow.create()
   }

   switchTab = function (tabId) {
      let canFocus = false
      this.parentWindow.getBrowserWindow().getChildWindows().forEach((childWindow, index) => {
         if (childWindow.tabId === tabId) {
            childWindow.focus()
            childWindow.show()
            canFocus = true
         }
      })

      if (!canFocus) {
         this.restoreSavedTab(tabId)
      }
   }

   restoreSavedTab = function (tabId) {
      let savedTabInfo = savedTabStorage.get(tabId)
      if (!savedTabInfo.lastURL) return
      this.createTab(savedTabInfo.lastURL, tabId)
   }

   restoreButDontOpenTabs = function () {
      const savedTabs = JSON.parse(JSON.stringify(savedTabStorage.store))
      Object.keys(savedTabs).forEach(tabId => {
         const tab = savedTabs[tabId]
         let tabInfo = {
            tabId: tabId,
            isLoading: false,
            favIcon: tab.favIcon,
            title: ''
         }
         
         // Send the tab to be created with its info
         this.sendWebbar('create-tab', tabInfo)
      })
   }

   attachEventsToBrowserWindow = function (customBrowserWindow, tabInfo) {
      let browserWindowContext = customBrowserWindow.getBrowserWindow()
      browserWindowContext.on('close', function (event) {
         this.sendWebbar('closed-tab', tabInfo)
      }.bind(this))

      browserWindowContext.webContents.on('did-start-loading', function () {
         tabInfo.isLoading = true
         this.sendWebbar('update-tab', tabInfo)
      }.bind(this))

      browserWindowContext.webContents.on('did-stop-loading', function () {
         tabInfo.isLoading = false
         this.sendWebbar('update-tab', tabInfo)
      }.bind(this))

      browserWindowContext.webContents.on('page-favicon-updated', function (event, favIcons) {
         if (favIcons.length > 0) {
            tabInfo.favIcon = favIcons[0]
            savedTabStorage.set(tabInfo.tabId, { lastURL: browserWindowContext.webContents.getURL(), favIcon: favIcons[0] })
            this.sendWebbar('update-tab', tabInfo)
         }
      }.bind(this))

      browserWindowContext.webContents.on('page-title-updated', function (event, title, explicitSet) {
         tabInfo.title = title
         this.sendWebbar('focused-tab', tabInfo)
      }.bind(this))

      browserWindowContext.webContents.on('did-start-navigation', function (event, url, isInPlace, isMainFrame, frameProcessId, frameRoutingId) {
         savedTabStorage.set(tabInfo.tabId, { lastURL: url })
      }.bind(this))
   }

   sendWebbar = function (name, response) {
      this.webbarWindow.getBrowserWindow().webContents.send('request-response', 'ng-webbar', name, response)
   }
}