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
 * @param {Object} data
 *
 * @returns {Promise<Object>} file
 */
module.exports = async (file, data) => {
  const isMarkdown = /\.md|\.mdown|\.markdown/.test(path.extname(file))
  try {
    const content = await fs.readFile(path.resolve(file), 'utf8')
    const fm = frontMatter(content)
    return {
      source: file,
      data: merge({}, data, { page: fm.attributes || {} }),
      content: isMarkdown ? marked(fm.body) : fm.body,
      haveAttributes: Object.keys(fm.attributes).length,
    }
  } catch (err) {
    return logger.fail(
      chalk`Failed to read {yellow ${path.basename(file)}}`,
      err
    )
  }
}
