// Setup storage for electron
const store = require('electron-store')
const electronStore = new store({accessPropertiesByDotNotation: false})

const { defaultWindowDetails, focusedWindow, createWindow } = require('./create')
const { windowOptions } = require('./options')

class WebBar {
   static windowDetails = {
      width: 1366,
      height: 42
   }

   static parentWindow = null
   static webbarWindow = null
   
   static openWindow = function (url, options) {
      if (this.webbarWindow === null) return

      let parentPosition = this.parentWindow.getPosition()

      // Setup the new window
      let newWindow = createWindow(url, options)
      newWindow.setParentWindow(this.parentWindow)
      newWindow.setPosition(parentPosition[0], parentPosition[1] + this.windowDetails.height)
      newWindow.setSize(defaultWindowDetails.width, defaultWindowDetails.height - this.windowDetails.height)
   }

   static restoreWindow = function (storageToken) {
      console.log(storageToken)

      if (this.webbarWindow === null) return
      
      let savedWindow = this.getWindowDetails(storageToken)
      if (!savedWindow || savedWindow === null) return

      // Minimize all children windows
      let childWindows = this.parentWindow.getChildWindows()
      let windowRestored = false
      
      // Go through the keys check if window was restored
      childWindows.forEach((child, index) => {
         if (child.windowKey === savedWindow.windowKey) {
            windowRestored = true
            child.restore()
            child.focus()
         }
      })

      if (windowRestored) return

      electronStore.delete(storageToken)
      this.openWindow(savedWindow.windowURL, windowOptions.childWindowOptions)      
   }

   static update = function () {
      if (this.webbarWindow === null) return

      let focusedTab = focusedWindow()
      // Get the info added to respose list
      let response = {
         tabs: [],
         activeTab: null
      }
     
      const savedWindows = this.getElectronStore()
      Object.keys(savedWindows).forEach(token => {
         let savedWindow = this.getWindowDetails(token)
         if (!savedWindow || savedWindow === null) return

         let windowInfo = {
            storageToken: token,
            windowURL: savedWindow.windowURL,
            windowKey: savedWindow.windowKey,
         }

         if (savedWindow.windowIcon && savedWindow.windowIcon.length > 0) {
            windowInfo.windowIcon = savedWindow.windowIcon[0]
         }

         response.tabs.push(windowInfo)
      })

      // Send the webbar window an alert of open window
      this.webbarWindow.webContents.send('request-response', 'ng-webbar', 'open-tabs', response)
   }

   static updateSession = async function(newWindow) {
      const savedWindows = this.getElectronStore()
      await new Promise(resolve => {
         Object.keys(savedWindows).forEach(token => {
            let savedWindow = this.getWindowDetails(token)

            if (!savedWindow || savedWindow === null) return

            if (savedWindow.windowKey === newWindow.windowKey) {
               // Update electron store
               electronStore.set(token, newWindow)
            }
         })
         resolve()
      })
   }

   static getElectronStore = () => {
      return JSON.parse(JSON.stringify(electronStore.store))
   }

   static getWindowDetails = (storageToken) => {
      return electronStore.get(storageToken)
   }
}

module.exports = WebBar;