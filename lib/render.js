const path = require('path')
const nunjucks = require('../core/nunjucks')
const preferLocal = require('prefer-local')
const chalk = require('chalk')
const injectData = require('./inject-data')
const injectLayout = require('./inject-layout')
const logger = require('./logger')

/**
 * Wrap an extends tag and a content block around and render
 * nunjucks template and return a Promise resloves to an object
 * with file path and rendered content
 *
 * @param {string} source
 * @param {object} opts
 *
 * @returns {Promise}
 */
module.exports = async (source, opts) => {
  const compiler = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(opts.templates)
  )
  try {
    const file = injectLayout(await injectData(source, opts.data), opts.block)
    return new Promise((resolve, reject) => {
      compiler.renderString(file.content, file.data, (err, content) => {
        if (err) {
          reject(err)
        }
        resolve({
          path: path.resolve(source),
          content,
          isClean: preferLocal(file.data, 'page.clean', opts.clean),
        })
      })
    })
  } catch (err) {
    return logger.fail(
      chalk`Error rendering {yellow ${path.basename(source)}}`,
      err
    )
  }
}
