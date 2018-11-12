const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const logger = require('./logger')
const { minify } = require('html-minifier')

/**
 * Minify and write a rendered file with given options
 *
 * @param {object} file
 * @param {object} opts
 *
 * @returns {Promise}
 */
module.exports = (file, opts) => {
  opts.rootPath = opts.rootPath || process.cwd()
  const dest = path.join(opts.out, path.relative(opts.rootPath, path.dirname(file.path)))
  const basefile = path.parse(file.path).name
  let destfile = path.join(dest, `${basefile}.html`)
  if (file.isClean) {
    destfile = path.join(dest, basefile, 'index.html')
  }
  if (opts.minify && file.content.length) {
    file.content = minify(file.content, opts.minifyOpts)
  }
  return fs.ensureDir(dest)
    .then(() => fs.outputFile(destfile, file.content))
    .then(() => destfile)
    .catch(err => logger.fail(chalk`Error writing {yellow ${path.relative(opts.out, destfile)}}`, err))
}
