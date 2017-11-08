const path = require('path')
const fs = require('fs')
const _ = require('lodash')
const dataDir = require('data-dir')

module.exports = file => {
  if (_.isString(file) && fs.lstatSync(file).isDirectory()) {
    return dataDir(path.resolve(file))
  } else {
    return JSON.parse(fs.readFileSync(file)) || {}
  }
}
