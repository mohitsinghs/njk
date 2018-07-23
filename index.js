const fs = require('fs-extra')
const path = require('path')
const deepFiles = require('deep-files')
const render = require('./lib/render')
const write = require('./lib/write')
const logger = require('./lib/logger')
const chalk = require('chalk')

/**
 * For a given file or array of files render html pages
 *
 * @param {string} input files or array of files to process
 * @param {object} options extra configuration
 */
module.exports = (source, opts) => {
  opts.rootPath || (opts.rootPath = process.cwd())
  if (Array.isArray(source)) {
    // process each file of the array
    source.forEach(file => {
      if (fs.lstatSync(file).isFile()) {
        processFile(file, opts)
      } else if (fs.lstatSync(file).isDirectory()) {
        processDir(file, opts)
      }
    })
  } else if (fs.lstatSync(source).isFile()) {
    processFile(source, opts)
  }

  function processDir (dir, opts) {
    let count = 0
    deepFiles(dir, '*.{njk,html,md,mdown,markdown}')
      .forEach(file => {
        opts.rootPath = dir
        processFile(file, opts)
        count++
      })
    if (!opts.verbose) {
      logger.success(`Wrote ${count} file(s)`)
    }
  }

  function processFile (file, opts) {
    render(file, opts)
      .then(result => write(result, opts))
      .catch(err => logger.fail(chalk`Error processing {yellow ${path.basename(file)}}`, err))
  }
}
