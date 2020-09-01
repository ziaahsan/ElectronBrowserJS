// Requires windows kind definitions file
const kinds = require('./WindowsKindsDefinition')

module.exports = (item) => {
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
  } else {
    item["SYSTEM.ICON"] = kinds["KIND_UNKNOWN"].css
  }
  
  return item
}