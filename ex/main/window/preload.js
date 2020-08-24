// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const isDev = require('electron-is-dev');
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
      window.postMessage({type: "NG_REQUEST", name:event.data.type, results:data});
    })()

  }, false)
})
