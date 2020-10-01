"use strict";
// Menu
const { MenuItem } = require('electron')
// Context Menu
const ContextMenuBuilder = require('../lib/contextMenuBuilder')
// Type of custom BrowserWindows
const WebbarBrowserWindow = require('./type/webbarBrowserWindow')
const SpotlightBrowserWindow = require('./type/spotlightBrowserWindow')
const HttpBrowserWindow = require('./type/httpBrowserWindow')
// Shortcuts for windows
const localShortcut = require('electron-localshortcut');

// All type of browserWindows handler
module.exports = class BrowserWindows {
   constructor() {
      // Nothing...
   }

   createDefaultWindows = async function () {
      // Load webbar
      this.webbarWindow = new WebbarBrowserWindow()
      this.webbarWindow.browserWindow.webContents.on('context-menu', this._onWebbarContextMenu)

      await this.webbarWindow.loadFile('public/webbar.html').then(res => {
         // Register localShort for webbarWindow
         this.addShortcutsToWindow(this.webbarWindow.browserWindow)
         // Add context menu
         this.webbarContextMenuBuilder = new ContextMenuBuilder(this.webbarWindow.browserWindow, true);
         // Load spotlight
         this.loadSpotlight()
      }).catch(e => {
         console.error(e)
      })
   }

   loadSpotlight = async function () {
      // Load spotlight
      if (!this.spotlightWindow) {
         this.spotlightWindow = new SpotlightBrowserWindow(this.webbarWindow)
         this.spotlightWindow.browserWindow.on('closed', this._onSpotlightBrowserWindowClosed)
         await this.spotlightWindow.loadFile('public/index.html').then(res => {
            // Register localShort for spotlight
            localShortcut.register(this.spotlightWindow.browserWindow, 'Ctrl+T', this._shortcutCtrlT)
         }).catch(e => {
            console.error(e)
         })
      } else {
         this.spotlightWindow.browserWindow.show()
         this.spotlightWindow.browserWindow.focus()
      }
   }

   loadURL = async function (urlString, windowId = '') {
      // WebbarWindow, or spotlightWindow was null
      if (!this.webbarWindow || !this.spotlightWindow) {
         console.error("All default windows must be present.")
         return
      }

      let httpContextMenuBuilder = null

      let httpWindow = new HttpBrowserWindow(this.webbarWindow, windowId)
      httpWindow.browserWindow.webContents.on('new-window', this._onNewHttpWindow)
      httpWindow.browserWindow.webContents.on('context-menu', (e, info) => {
         if (!httpContextMenuBuilder) return
         httpContextMenuBuilder.buildMenuForElement(info).then((menu) => {
            menu.insert(0, new MenuItem({
               label: 'Back',
               accelerator: 'Alt+Left',
               enabled:
                  this.webbarWindow.focusedBrowserWindow &&
                  this.webbarWindow.focusedBrowserWindow.webContents.canGoBack(),
               click: this._shortcutAltLeft
            }))
            menu.insert(1, new MenuItem({
               label: 'Forward',
               accelerator: 'Alt+Right',
               enabled:
                  this.webbarWindow.focusedBrowserWindow &&
                  this.webbarWindow.focusedBrowserWindow.webContents.canGoForward(),
               click: this._shortcutAltRight
            }))
            menu.insert(2, new MenuItem({ type: 'separator' }))
            menu.insert(3, new MenuItem({
               label: 'Find in page',
               accelerator: 'CmdOrCtrl+F',
               enabled:
                  this.webbarWindow.focusedBrowserWindow &&
                  this.webbarWindow.focusedBrowserWindow.windowId !== process.env['SPOTLIGHT_WINDOW_NAME'],
               click: this._shortcutCtrlF
            }))
            menu.insert(4, new MenuItem({ type: 'separator' }))

            // Using electron-localshortcut so disabling accelerator by ignoring setMenu
            // @Note: This is required to enable/trigger accelerator
            // httpWindow.browserWindow.setMenu(menu)
            menu.popup(this.webbarWindow.browserWindow)
         })
      })

      try {
         // Check and see if URL is valid, proceed
         new URL(urlString)
      } catch {
         // Setup default url to google search
         urlString = `https://www.google.com/search?q=${encodeURIComponent(urlString)}`
      }

      httpWindow.browserWindow.focus()
      await httpWindow.loadHttp(urlString).then(() => {
         // Register localShort for httpWindow
         this.addShortcutsToWindow(httpWindow.browserWindow)
         // Add context menu
         httpContextMenuBuilder = new ContextMenuBuilder(httpWindow.browserWindow, true);
      }).catch(e => {
         console.error(e)
      })
   }

   loadBlank = async function () {
      // Hide all other windows, and create new URL
      await this.showWindowByWindowId('').then(result => {
         this.loadURL('https://google.ca')
      })
   }

   laodWindow = async function (windowId) {
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
               childWindow.show()
               childWindow.focus()
               hasFocus = true
            } else {
               childWindow.hide()
            }
         }

         if (hasFocus) {
            resolve(true)
         } else {
            resolve(false)
         }
      })
   }

   unloadWindow = async function (windowId) {
      await new Promise(resolve => {
         for (let childWindow of this.webbarWindow.browserWindow.getChildWindows()) {
            if (childWindow.windowId === windowId) {
               childWindow.destroy()
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
      if (!this.webbarWindow || !this.webbarWindow.focusedBrowserWindow) return
      if (this.webbarWindow.focusedBrowserWindow.windowId !== windowId) return


      let focusedChild = this.webbarWindow.focusedBrowserWindow
      if (focusedChild.webContents.canGoBack())
         focusedChild.webContents.goBack()
   }

   loadNextPage = function (windowId) {
      if (!this.webbarWindow || !this.webbarWindow.focusedBrowserWindow) return
      if (this.webbarWindow.focusedBrowserWindow.windowId !== windowId) return

      let focusedChild = this.webbarWindow.focusedBrowserWindow
      if (focusedChild.webContents.canGoForward())
         focusedChild.webContents.goForward()
   }

   findInFocusedPage = function (searchTerm) {
      if (!this.webbarWindow || !this.webbarWindow.focusedBrowserWindow) return
      if (searchTerm === '') return

      this.webbarWindow.focusedBrowserWindow.webContents.findInPage(searchTerm)
   }

   stopFindInFocusedPage = function (action) {
      if (!this.webbarWindow || !this.webbarWindow.focusedBrowserWindow) return
      if (action === '')
         action = 'clearSelection'

      this.webbarWindow.focusedBrowserWindow.webContents.stopFindInPage(action)
   }

   addShortcutsToWindow = function (win) {
      localShortcut.register(win, 'Alt+Left', this._shortcutAltLeft)
      localShortcut.register(win, 'Alt+Right', this._shortcutAltRight)
      localShortcut.register(win, 'Ctrl+F', this._shortcutCtrlF)
      localShortcut.register(win, 'Ctrl+T', this._shortcutCtrlT)
      localShortcut.register(win, 'Ctrl+Space', this._shortcutCtrlSpace)
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
            label: 'New tab',
            accelerator: 'CmdOrCtrl+T',
            click: this._shortcutCtrlT
         }))
         menu.insert(1, new MenuItem({ type: 'separator' }))
         
         menu.popup(this.webbarWindow.browserWindow)
      })
   }.bind(this)

   _onSpotlightBrowserWindowClosed = function () {
      this.webbarWindow.browserWindow.off('move', this.spotlightWindow._onWebBarBrowserWindowMove)
      this.webbarWindow.browserWindow.off('resize', this.spotlightWindow._onWebBarBrowserWindowResize)
      this.spotlightWindow = null
   }.bind(this)

   _onNewHttpWindow = function (event, url, frameName, disposition, options, additionalFeatures, referrer, postBody) {
      event.preventDefault()
      this.loadURL(url)
   }.bind(this)

   //<summar>
   // Local Shortcuts
   //</summary>
   _shortcutCtrlT = function () {
      this.loadBlank()
   }.bind(this)

   _shortcutCtrlF = function () {
      this.webbarWindow.browserWindow.webContents.focus()
      this.webbarWindow.browserWindow.webContents.send('show-find-in-page')
   }.bind(this)

   _shortcutCtrlSpace = function () {
      this.loadSpotlight()
   }.bind(this)

   _shortcutAltLeft = function () {
      this.webbarWindow.focusedBrowserWindow.webContents.goBack()
   }.bind(this)

   _shortcutAltRight = function () {
      this.webbarWindow.focusedBrowserWindow.webContents.goForward()
   }.bind(this)
}
