const fs = require('fs-extra')
const path = require('path')
const deepFiles = require('deep-files')
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
  if (Array.isArray(source)) {
    // multiple files/directories
    source.forEach(file => {
      if (fs.lstatSync(file).isFile()) {
        processFile(file, opts)
          .then(res => {
            logger.success(chalk`Wrote {yellow ${path.relative(opts.out, res)}}`)
          })
      } else if (fs.lstatSync(file).isDirectory()) {
        processDir(file, opts)
      }
    })
  } else if (fs.lstatSync(source).isFile()) {
    // single/changed file
    processFile(source, opts)
      .then(res => {
        logger.success(chalk`Wrote {yellow ${path.relative(opts.out, res)}}`)
      })
  }

  function processDir (dir, opts) {
    const time = process.hrtime()
    const results = deepFiles(dir, '*.{njk,html,md,mdown,markdown}')
      .map(f => processFile(f, opts))
    printResult(results, opts, time)
  }

  function processFile (file, opts) {
    return render(file, opts)
      .then(result => write(result, opts))
      .catch(err => logger.fail(chalk`Error processing {yellow ${path.basename(file)}}`, err))
  }
}
