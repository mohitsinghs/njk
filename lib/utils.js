const path = require('path')
const fs = require('fs-extra')
const { gzipSync } = require('zlib')

/**
 * If a file exists add it to the given list
 * @param  {string} file file to be added
 * @param  {object} list list  of paths to add given file
 * @return {string}      file added to the list
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
 * @param  {string} file file to check existence
 * @param  {object} list list of paths to look inside
 * @return {string}      path containing file
 */
module.exports.isInside = (file, list) => {
  const _file = path.resolve(file)
  let parent = false
  list.forEach(item => {
    if (_file.includes(item)) {
      parent = item
    }
  })
  return parent
}

/**
 * Convert gzip file size to human readable format
 * @param  {string} file file to calculate size for
 * @return {string}      human readable size
 */
module.exports.humanSize = file => {
  const size = gzipSync(fs.readFileSync(file, 'utf8')).length
  if (size >> 20) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  }
  if (size >> 10) {
    return `${(size / 1024).toFixed(2)} KB`
  }
  return `${size} B`
}

/**
 * convert time difference of `process.hrtime` to human readable time
 * @param  {object} td time difference of `process.hrtime`
 * @return {string}    human readable time
 */
module.exports.humanTime = td => {
  if (td[0]) {
    return `${(td[0] + (td[1] / 1e9)).toFixed(2)}s`
  }
  return `${(td[1] / 1e6).toFixed(2)}ms`
}
