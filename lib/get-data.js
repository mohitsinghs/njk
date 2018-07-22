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
  const dataSource = path.resolve(src)
  if (fs.existsSync(dataSource)) {
    try {
      if (fs.lstatSync(dataSource).isDirectory()) {
        return dataDir(dataSource)
      } else {
        return fs.readJsonSync(dataSource)
      }
    } catch (err) {
      logger.fail(`Error reading data from ${src}`, err)
    }
  } else {
    logger.warn(`Using empty global data`)
    return {}
  }
}
