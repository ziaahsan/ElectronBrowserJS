"use strict";
// Menu
const { MenuItem } = require('electron')
// Context Menu
const ContextMenuBuilder = require('../lib/contextMenuBuilder')
// Custom browserwindow instance
const CustomBrowserWindowInstance = require('./custom/browserWindow')
// Type of custom BrowserWindows
const WebbarBrowserWindow = require('./type/webbarBrowserWindow')
const WebbarTabBrowserWindow = require('./type/webbarTabBrowserWindow')
const HttpBrowserWindow = require('./type/httpBrowserWindow')
// Shortcuts for windows
const localShortcut = require('electron-localshortcut');
const fetch = require('cross-fetch');
const { async } = require('crypto-random-string');

// All type of browserWindows handler
class BrowserWindows {
   constructor() {
      // Nothing...
   }

   createDefaultWindows = async function () {
      // Load webbar
      this.webbarWindow = new WebbarBrowserWindow()
      this.webbarWindow.browserWindow.webContents.on('context-menu', this._onWebbarContextMenu)
      
      // Load browser
      await this.webbarWindow.loadHttp(`${process.env['PROTOCOL_APP']}://webbar.html`).then(res => {
         // Register localShort for webbarWindow
         this.addShortcutsToWindow(this.webbarWindow.browserWindow)
         // Add context menu
         this.webbarContextMenuBuilder = new ContextMenuBuilder(this.webbarWindow.browserWindow, true)
         this.setupMarketWatch()
         // this.setuphWeatherAPI()
         // Load WebbarTabs
         // this.loadWebbarTabBrowserWindow()
      }).catch(e => {
         console.error(e)
      })
   }

   setuphWeatherAPI = async function(term='Toronto', units='metrics') {
      let url = `https://openweathermap.org/data/2.5/find?q=${term}&appid=439d4b804bc8187953eb36d2a8c26a02&units=${units}`
      fetch(url).then(res => res.json()).then((out) => {
         this.webbarWindow.browserWindow.webContents.send('weather', out)
      }).catch(err => { throw err });
   }

   setupMarketWatch = async function (symbol='tsla') {
      if (!this.marketWatch) {
         this.marketWatch = this.loadURL(`https://stocktwits.com/symbol/${symbol}`)
      }
   }

   loadWebbarTabBrowserWindow = async function () {
      if (!this.webbarTabWindow) {
         this.webbarTabWindow = new WebbarTabBrowserWindow(this.webbarWindow)
         await this.webbarTabWindow.loadHttp(`${process.env['PROTOCOL_APP']}://webbar.html`).then(res => {
            // Pass
         }).catch(e => {
            console.error(e)
         })
      }
   }

   loadURL = async function (urlString, windowId = '') {
      // WebbarWindow
      if (!this.webbarWindow) {
         console.error("All default windows must be present.")
         return
      }

      try {
         // Check and see if URL is valid, proceed
         new URL(urlString)
      } catch {
         // Setup default url to google search
         urlString = `https://www.google.com/search?q=${encodeURIComponent(urlString)}`
      }

      let httpContextMenuBuilder = null
      let httpWindow = null

      if (windowId === '') {
         httpWindow = new HttpBrowserWindow(this.webbarWindow, windowId)

         httpWindow.browserWindow.webContents.on('new-window', this._onNewHttpWindow)
         httpWindow.browserWindow.webContents.on('context-menu', (e, info) => {
            if (!httpContextMenuBuilder) return
            httpContextMenuBuilder.buildMenuForElement(info).then((menu) => {
               menu.insert(0, new MenuItem({
                  label: 'Back',
                  accelerator: 'Alt+Left',
                  enabled:
                     this.webbarWindow.focused.browserWindow &&
                     this.webbarWindow.focused.browserWindow.webContents.canGoBack(),
                  click: this._shortcutAltLeft
               }))
               menu.insert(1, new MenuItem({
                  label: 'Forward',
                  accelerator: 'Alt+Right',
                  enabled:
                     this.webbarWindow.focused.browserWindow &&
                     this.webbarWindow.focused.browserWindow.webContents.canGoForward(),
                  click: this._shortcutAltRight
               }))
               menu.insert(2, new MenuItem({ type: 'separator' }))
               menu.insert(3, new MenuItem({
                  label: 'Find in Page',
                  accelerator: 'CmdOrCtrl+F',
                  enabled:
                     this.webbarWindow.focused.browserWindow,
                  click: this._shortcutCtrlF
               }))
               menu.insert(4, new MenuItem({ type: 'separator' }))

               // Using electron-localshortcut so disabling accelerator by ignoring setMenu
               // @Note: This is required to enable/trigger accelerator
               // httpWindow.browserWindow.setMenu(menu)
               menu.popup(this.webbarWindow.browserWindow)
            })
         })

         httpWindow.browserWindow.focus()
         await httpWindow.loadHttp(urlString).then(() => {
            // Register localShort for httpWindow
            this.addShortcutsToWindow(httpWindow.browserWindow)
            // Add context menu
            httpContextMenuBuilder = new ContextMenuBuilder(httpWindow.browserWindow, true)
         }).catch(e => {
            console.error(e)
         })
      }

      if (windowId !== '') {
         if (!this.webbarWindow) return
         if (!this.webbarWindow.focused) return
         if (!this.webbarWindow.focused.browserWindow) return

         let focusedChild = this.webbarWindow.focused.browserWindow
         if (!focusedChild.windowId) return
         if (focusedChild.windowId !== windowId) return

         focusedChild.loadURL(urlString).then(() => {
            console.log("Loading URL on focused window")
         }).catch(e => {
            console.error(e)
         })
      }
   }

   loadBlank = async function () {
      // Hide all other windows, and create new URL
      await this.showWindowByWindowId('').then(hasFocus => {
         if (!hasFocus)
            this.loadURL('https://google.ca')
      })
   }

   loadWindow = async function (windowId) {
      await this.showWindowByWindowId(windowId).then(result => {
         if (result) return
         let storedWindow = HttpBrowserWindow.getStoredWindowById(windowId)
         if (!storedWindow || !storedWindow.url) {
            this.loadURL('https://google.ca', windowId)
         } else {
            this.loadURL(storedWindow.url, windowId)
         }
      }).catch(e => {
         console.error(e)
      })
   }

   showWindowByWindowId = function (windowId) {
      return new Promise(resolve => {
         let hasFocus = false
         for (let childWindow of this.webbarWindow.browserWindow.getChildWindows()) {
           if (childWindow.windowId === windowId) {
               childWindow.setOpacity(1)
               childWindow.focus()
               hasFocus = true
            } else {
               childWindow.setOpacity(0)
            }
         }

         resolve(hasFocus)
      })
   }

   unloadWindow = async function (windowId) {
      await new Promise(resolve => {
         for (let childWindow of this.webbarWindow.browserWindow.getChildWindows()) {
            if (childWindow.windowId === windowId) {
               childWindow.destroy()
               if (this.webbarWindow.focused.browserWindow.windowId === windowId)
                  this._onLoadPreviousFocusedWindow()
               
               HttpBrowserWindow.removeStoredWindowById(windowId)
               resolve(true)

               return
            }
         }

         HttpBrowserWindow.removeStoredWindowById(windowId)
         resolve(true)
      }).catch(e => {
         console.error(e)
      })
   }

   loadPreviousPage = async function (windowId) {
      if (!this.webbarWindow) return
      if (!this.webbarWindow.focused) return
      if (!this.webbarWindow.focused.browserWindow) return

      let focusedChild = this.webbarWindow.focused.browserWindow
      if (!focusedChild.windowId) return
      if (focusedChild.windowId !== windowId) return

      if (focusedChild.webContents.canGoBack())
         focusedChild.webContents.goBack()
   }

   loadNextPage = function (windowId) {
      if (!this.webbarWindow) return
      if (!this.webbarWindow.focused) return
      if (!this.webbarWindow.focused.browserWindow) return

      let focusedChild = this.webbarWindow.focused.browserWindow
      if (!focusedChild.windowId) return
      if (focusedChild.windowId !== windowId) return

      if (focusedChild.webContents.canGoForward())
         focusedChild.webContents.goForward()
   }

   findInFocusedPage = function (searchTerm) {
      if (searchTerm === '') return

      if (!this.webbarWindow) return
      if (!this.webbarWindow.focused) return
      if (!this.webbarWindow.focused.browserWindow) return

      this.webbarWindow.focused.browserWindow.webContents.findInPage(searchTerm)
   }

   stopFindInFocusedPage = function (action) {
      if (!this.webbarWindow) return
      if (!this.webbarWindow.focused) return
      if (!this.webbarWindow.focused.browserWindow) return

      if (action === '')
         action = 'clearSelection'

      this.webbarWindow.focused.browserWindow.webContents.stopFindInPage(action)
   }

   addShortcutsToWindow = function (win) {
      localShortcut.register(win, 'Alt+Left', this._shortcutAltLeft)
      localShortcut.register(win, 'Alt+Right', this._shortcutAltRight)
      localShortcut.register(win, 'Ctrl+F', this._shortcutCtrlF)
      localShortcut.register(win, 'Ctrl+T', this._shortcutCtrlT)
      localShortcut.register(win, 'Ctrl+W', this._shortcutCtrlW)
   }

   //<summar>
   // Special listeners for instacnes
   //</summary>
   _onWebbarContextMenu = function (e, info) {
      this.webbarContextMenuBuilder.buildMenuForElement(info).then((menu) => {
         if (info.isEditable || (info.inputFieldType && info.inputFieldType !== 'none')) {
            menu.popup(this.webbarWindow.browserWindow)
            return
         }

         menu.insert(0, new MenuItem({
            label: 'New Tab',
            accelerator: 'CmdOrCtrl+T',
            click: this._shortcutCtrlT
         }))
         menu.insert(1, new MenuItem({ type: 'separator' }))
         
         menu.popup(this.webbarWindow.browserWindow)
      })
   }.bind(this)

   _onNewHttpWindow = function (event, url, frameName, disposition, options, additionalFeatures, referrer, postBody) {
      event.preventDefault()
      this.loadURL(url)
   }.bind(this)

   _onLoadPreviousFocusedWindow = function () {
      let windowId = this.webbarWindow.focusedHistory.slice(-2, -1)
      if (windowId.length === 1) this.loadWindow(windowId[0])
   }.bind(this)

   //<summar>
   // Local Shortcuts
   //</summary>
   _shortcutCtrlT = function () {
      this.loadBlank()
   }.bind(this)

   _shortcutCtrlW = function () {
      this.unloadWindow(this.webbarWindow.focused.browserWindow.windowId)
   }.bind(this)

   _shortcutCtrlF = function () {
      this.webbarWindow.browserWindow.webContents.focus()
      this.webbarWindow.browserWindow.webContents.send('show-find-in-page')
   }.bind(this)

   _shortcutAltLeft = function () {
      this.webbarWindow.focused.browserWindow.webContents.goBack()
   }.bind(this)

   _shortcutAltRight = function () {
      this.webbarWindow.focused.browserWindow.webContents.goForward()
   }.bind(this)
}

module.exports = BrowserWindows
