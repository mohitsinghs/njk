const path = require('path')
const fs = require('fs-extra')
const frontMatter = require('front-matter')
const marked = require('marked')
const chalk = require('chalk')
const merge = require('lodash.merge')
const logger = require('./logger')

/**
 * Extract front-matter and return a Promise which resloves
 * to an object with data, file contents and a boolean
 * whether front-matter is present or not
 *
 * @param {string} file
 * @param {object} data
 *
 * @returns {Promise} file
 */
module.exports = (file, data) => {
  const isMarkdown = /\.md|\.mdown|\.markdown/.test(path.extname(file))
  return fs
    .readFile(path.resolve(file), 'utf8')
    .then(content => frontMatter(content))
    .then(fm => {
      return {
        data: merge({}, data, { page: fm.attributes || {} }),
        content: isMarkdown ? marked(fm.body) : fm.body,
        haveAttributes: Object.keys(fm.attributes).length
      }
    })
    .catch(err =>
      logger.fail(chalk`Failed to read {yellow ${path.basename(file)}}`, err)
    )
}
