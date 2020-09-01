// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const requests = require('./requests')


process.once('loaded', () => {
  //@todo: Add COOP
  window.addEventListener('message', event => requests.fetch(event), false)
})
