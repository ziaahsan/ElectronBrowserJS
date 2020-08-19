// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const isDev = require('electron-is-dev');
const conn = require('./connect')
conn.build()

process.once('loaded', () => {
  window.addEventListener('message', event => {
    //@todo: Add COOP
    if (event.source != window) return
    if (event.data.type == null || event.data.type == undefined || event.data.type != "BG_REQUEST") return
    if (!event.data.name || event.data.name.length < 1) return

    (async () => {
      let data = await conn.send("NODE_REQUEST", event.data.name)
      console.log("3.", data)
      // window.postMessage({type: "NG_REQUEST", name: event.data.name, results:data});
    })()

  }, false)
})