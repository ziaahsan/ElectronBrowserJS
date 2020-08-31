// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const isDev = require('electron-is-dev')
const kinds = require('../types/kinds')
const conn = require('./connect')
conn.build()

const validRequestTypes = ['select-directories']

process.once('loaded', () => {
  window.addEventListener('message', event => {
    //@todo: Add COOP
    if (event.source != window) return
    if (event.data.type == null || event.data.type == undefined || !validRequestTypes.includes(event.data.type)) return

    (async () => {
      let data = await conn.send(event.data.type, event.data.q)
      await new Promise((resolve, reject) => {
        data = JSON.parse(data)
        data.forEach(item => {
          // Settingup extention icons
          if (item['SYSTEM.KIND'] != null) {
            Object.keys(kinds).forEach(key => {
              const mnemonics = kinds[key].mnemonics.split("|")
              const found = mnemonics.some((e) => item['SYSTEM.KIND'].includes(e))
              if (found) {
                item["SYSTEM.ICON"] = kinds[key].css
                return;
              }
            })
          } else if (item['SYSTEM.FILEEXTENSION'] && item['SYSTEM.FILEEXTENSION'] != null) {
            item['SYSTEM.FILEEXTENSION'] = item['SYSTEM.FILEEXTENSION'].substr(1)
            item["SYSTEM.ICON"] = `${item['SYSTEM.FILEEXTENSION']}-icon`.toLocaleLowerCase()
          } else if (item['SYSTEM.ITEMTYPE'] && item['SYSTEM.ITEMTYPE']) {
            item["SYSTEM.ICON"] = `${item['SYSTEM.ITEMTYPE']}-icon`.toLocaleLowerCase()
          } else {
            item["SYSTEM.ICON"] = "defaualt-icon"
          }
        });
        resolve()
      });
      console.log(data)
      window.postMessage({type: "NG_REQUEST", name:event.data.type, results:data})
    })()

  }, false)
})
