const path = require('path')
const fs = require('fs-extra')

/**
 * If a file exists add it to the given list
 */
module.exports.addIfExists = (file, list) => {
  const _file = path.resolve(file)
  if (fs.existsSync(_file)) {
    list.push(_file)
  }
  return _file
}

/**
 * Check if a file is inside one of the folders of a list
 */
module.exports.isInside = (file, list) => {
  const _file = path.resolve(file)
  list.forEach(item => {
    if (_file.includes(item)) {
      return item
    }
  })
  return false
}
