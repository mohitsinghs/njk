const path = require('path')
const nunjucks = require('nunjucks')
const preferLocal = require('prefer-local')
const chalk = require('chalk')
const prepare = require('./prepare')
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
module.exports = (source, opts) => {
  const compiler = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(opts.templates)
  )
  return prepare(source, opts.data)
    .then((file) => {
      if (preferLocal(file.data, 'page.layout')) {
        const canUseBlock = preferLocal(file.data, 'page.block', opts.block)
        let layoutFile = file.data.page.layout
        layoutFile = !path.extname(layoutFile)
          ? layoutFile.concat('.njk')
          : layoutFile
        const extendLayout = `{% extends "${layoutFile}" %}`
        const extendBlock = `{% block content %}${file.content}{% endblock %}`
        file.content = `${extendLayout} ${
          canUseBlock ? extendBlock : file.content
        }`
      } else if (file.haveAttributes) {
        // file have front-matter but no layout property is found
        throw Error(
          chalk`No layout declared in front-matter or data for {yellow ${path.basename(
            source
          )}}`
        )
      }
      return file
    })
    .then((file) => {
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
    })
    .catch((err) =>
      logger.fail(chalk`Error rendering {yellow ${path.basename(source)}}`, err)
    )
}
