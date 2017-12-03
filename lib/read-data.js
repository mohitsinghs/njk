const path = require('path')
const fs = require('fs')
const dataDir = require('data-dir')

module.exports = file => {
  if (file) {
    if (fs.lstatSync(file).isDirectory()) {
      return dataDir(path.resolve(file))
    } else {
      return JSON.parse(fs.readFileSync(file))
    }
  } else {
    return {}
  }
}
