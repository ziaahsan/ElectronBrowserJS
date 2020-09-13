// Setup storage for electron
const Store = require('electron-store')
const electronStore = new Store()

const { createWindow } = require('./create')
const { routes, windowOptions } = require('./options')

class WebBar {
   static createNewWindow = function (parent, webbarWindow, url, options) {
      // Setup the new window
      let newAppWindow = createWindow(url, options)
      newAppWindow.setParentWindow(parent)

      // Update the webbar
      newAppWindow.on('show', () => {
         this.update(webbarWindow)
      })
   }

   static resotreWindow = function (storageToken, parent, webbarWindow) {
      let savedWindowDetails = this.getWindowDetails(storageToken)
      if (!savedWindowDetails || savedWindowDetails === null) return

      // Minimize all children windows
      let childWindows = parent.getChildWindows()
      let windowRestored = false
      
      // Go through the keys check if window was restored
      childWindows.forEach((child, index) => {
         if (child.windowKey === savedWindowDetails.windowKey) {
            windowRestored = true
            child.restore()
            child.focus()
            return
         }
      })

      if (windowRestored) return

      electronStore.delete(storageToken)
      this.createNewWindow(parent, webbarWindow, savedWindowDetails.windowURL, windowOptions.childWindowOptions)
   }

   static update = function (webbarWindow) {
      // Setup the webbar based on saved windows if any
      const savedWindows = JSON.parse(JSON.stringify(electronStore.store))

      // Get the info added to respose list
      let response = []

      Object.keys(savedWindows).forEach(token => {
         let savedWindow = savedWindows[token]
         if (!savedWindow || savedWindow.length == 0) return

         let windowInfo = {
            storageToken: token,
            windowName: savedWindow.windowName,
            windowIcon: savedWindow.windowIcon
         }

         response.push(windowInfo)
         // electronStore.onDidChange(savedWindow.windowName, this.onChange);
      })

      // Send the webbar window an alert of open window
      webbarWindow.webContents.send('request-response', 'ng-webbar', 'open-apps', response)
   }

   static getWindowDetails = (storageToken) => {
      let response = null
      // Setup the webbar based on saved windows if any
      const savedWindows = JSON.parse(JSON.stringify(electronStore.store))

      Object.keys(savedWindows).forEach(token => {
         let savedWindow = savedWindows[token]
         if (!savedWindow || savedWindow.length == 0) return
         if (storageToken === token) {
            response = savedWindow
         }
      })

      return response
   }
}

module.exports = WebBar;