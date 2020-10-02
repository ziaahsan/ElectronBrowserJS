// Setup path
const path = require('path')
// Electron theme handler
const nativeTheme = require('electron').nativeTheme

// Returns the icon path based on the theme
module.exports = (iconName, ext, size) => {
   let themeName = nativeTheme.shouldUseDarkColors ? 'light' : 'dark'
   return path.join(__dirname, `../../public/icons/${themeName}/${size}/${iconName}.${ext}`)
}
