const path = require('path')
const fs = require('fs-extra')
const dataDir = require('data-dir')
const logger = require('./logger')

/**
 * Get json form given directory or file. Return empty
 * data if nothing is found.
 *
 * @param {string} src source to read data from
 *
 * @returns {object}
 */
module.exports = src => {
  if (src) {
    try {
      const source = path.resolve(src)
      if (fs.existsSync(source)) {
        if (fs.lstatSync(source).isDirectory()) {
          return dataDir(source)
        } else {
          return fs.readJsonSync(source)
        }
      }
    } catch (err) {
      logger.fail(`Error reading data from ${src}`, err)
    }
  }
  logger.warn(`Using empty global data`)
  return {}
}
