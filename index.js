const fs = require('fs-extra')
const path = require('path')
const render = require('./lib/render')
const write = require('./lib/write')
const logger = require('./lib/logger')
const printResult = require('./lib/print-result')
const chalk = require('chalk')

/**
 * For a given file or array of files render html pages
 *
 * @param {string} input files or array of files to process
 * @param {object} options extra configuration
 */
module.exports = (source, opts) => {
  const isFile = f => fs.lstatSync(f).isFile()
  const processFile = file => {
    return render(file, opts)
      .then(result => write(result, opts))
      .catch(err =>
        logger.fail(
          chalk`Error processing {yellow ${path.basename(file)}}`,
          err
        )
      )
  }
  // multiple files
  if (Array.isArray(source)) {
    const time = process.hrtime()
    printResult(source.filter(isFile).map(processFile), opts, time)
  }
  if (isFile(source)) {
    // single/changed file
    const time = process.hrtime()
    printResult([processFile(source)], opts, time)
  }
}
