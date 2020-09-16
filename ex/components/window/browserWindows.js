// Generate token use
const crypto = require('crypto-random-string')
// Setup storage for electron
const store = require('electron-store')
const electronStore = new store({accessPropertiesByDotNotation: false})
// Setup is dev
const isDev = require('electron-is-dev')
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
         
         transparent: this.options.transparent,
         

         focusable: this.options.focusable,
         closable: this.options.closable,
         maximizable: this.maximizable,
         resizable: this.options.resizable,

         width: this.options.width,
         height: this.options.height,
   
         // skipTaskbar: true,
   
         blur: this.options.blur,
         blurType: "blurbehind",
         vibrancy: "fullscreen-ui",
   
         webPreferences: {
            worldSafeExecuteJavaScript: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
         }
      })
   }

   getBrowserWindow = function () {
      return this.browserWindow
   }

   create = async function () {
      if (this.options.center)
         this.browserWindow.center()
      
      if (this.options.parentBrowserWindow !== null)
         this.browserWindow.setParentWindow(this.options.parentBrowserWindow)

      if (this.options.position !== null)
         this.browserWindow.setPosition(this.options.position.x, this.options.position.y)

      // Events Must be initialized before the load
      // Setup readyToShow
      this.browserWindow.once('ready-to-show', this._readyToShowListener)

      // URL based on:
      if (this.url.indexOf('public/') === 0) {
         await this.browserWindow.loadFile(this.url)
      
      } else {
         await this.browserWindow.loadURL(this.url)
      }
   }

   _readyToShowListener = function() {
      if (isDev)
         this.browserWindow.webContents.openDevTools()
      
      this.browserWindow.show()
      this.browserWindow.focus()

      this.browserWindow.url = this.browserWindow.webContents.getURL()
      this.browserWindow.created = new Date()
   }.bind(this) // Add the scope of the class to function
}

module.exports = class BrowserWindows {
   constructor () {
      this.parentWindow,
      this.webbarWindow,
      this.spotlightWindow = null, null, null

      this.spinnerURL = 'icons/spinner.gif'
   }

   setupInitialBrowserWindows = function () {
      let id = 'parent'
      let url = 'public/blank.html'
      let options = {
         backgroundColor: '#ffffff',
         frame: false,
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
         position: null
      }

      this.parentWindow = new CustomBrowserWindow(id, url, options)
      this.parentWindow.create()

      // Automatically setup child webbarwindow, and spotlight
      this.setupWebbarBrowserWindow()
      this.setupSpotlightBrowserWindow()
   }

   setupWebbarBrowserWindow = function () {
      if (this.parentWindow === null)
         throw "Parent window is mssing!"

      let parentWidnowContext = this.parentWindow.getBrowserWindow()
      let parentPosition = parentWidnowContext.getPosition()
      
      let id = 'webbar'
      let url = 'public/webbar.html'
      let options = {
         backgroundColor: '#000000000',
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
         position: { x: parentPosition[0], y: parentPosition[1] }
      }

      this.webbarWindow = new CustomBrowserWindow(id, url, options)
      this.webbarWindow.create()
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
         position: { x: parentPosition[0], y: parentPosition[1] + 42 }
      }

      this.spotlightWindow = new CustomBrowserWindow(id, url, options)
      this.spotlightWindow.create()
   }

   openWindowByURL = function (token, urlString) {
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
         position: { x: parentPosition[0], y: parentPosition[1] + 42 }
      }

      return new CustomBrowserWindow(id, url, options)
   }

   createTab = function (urlString) {
      let webbarWindowContext = this.webbarWindow.getBrowserWindow()
      let token = crypto({ length: 8, type: 'alphanumeric' })
      let response = {
         tabId: token,
         favIcon: this.spinnerURL
      }
      this.sendWebbar('create-tab', response)

      let customBrowserWindow = this.openWindowByURL(token, urlString)
      let customBrowserWindowContext = customBrowserWindow.getBrowserWindow()
      // Attach events before creating the
      customBrowserWindowContext.webContents.once('page-favicon-updated', function (event, favIcons) {
         if (favIcons.length > 0) {
            response.favIcon = favIcons[0]
            this.sendWebbar('update-tab', response)
         }
      }.bind(this))

      // Create the window
      customBrowserWindow.create()
   }

   sendWebbar = function (name, response) {
      var webbarWindowContext = this.webbarWindow.getBrowserWindow()
      webbarWindowContext.webContents.send('request-response', 'ng-webbar', name, response)
   }
}