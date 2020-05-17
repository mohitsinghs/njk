const chalk = require('chalk')
const path = require('path')
const render = require('./lib/render')
const write = require('./lib/write')
const logger = require('./lib/logger')
const printResult = require('./lib/print-result')
const { isFile } = require('./lib/utils')

/**
 * For a given file or array of files render html pages
 *
 * @param {string} input files or array of files to process
 * @param {object} options extra configuration
 */
module.exports = (source, opts) => {
  // render and write files based on filename
  const processFile = async (file) => {
    try {
      const result = await render(file, opts)
      return await write(result, opts)
    } catch (err) {
      return logger.fail(
        chalk`Error processing {yellow ${path.basename(file)}}`,
        err
      )
    }
  }
  // multiple files
  if (Array.isArray(source)) {
    printResult(source.filter(isFile).map(processFile), opts, process.hrtime())
  } else if (isFile(source)) {
    // single/changed file
    printResult([processFile(source)], opts, process.hrtime())
  }
}
