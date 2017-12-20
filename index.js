const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const ora = require('ora')
const frontMatter = require('front-matter')
const marked = require('marked')
const nunjucks = require('nunjucks')
const minify = require('html-minifier').minify

module.exports = (files, data, flags) => {
  let spinner = ora('Processing files').start()
  if (!Array.isArray(files)) {
    files = [files]
  }
  Promise
    .resolve(files)
    .then(files => {
      return files
        .map(file => _resolveFile(file))
        .map(file => _processMarkdown(file))
        .map(file => _wrapLayout(file))
        .map(file => _renderTemplate(file))
        .map(file => _writeFile(file))
    })
    .then(results => {
      spinner.succeed(`Written ${results.length} ${results.length > 1 ? 'files' : 'file'}`)
    })
    .catch(err => {
      spinner.fail(err)
      process.exit(1)
    })

  function _resolveFile (file) {
    try {
      const fm = frontMatter(fs.readFileSync(path.resolve(file)).toString())
      return {
        data: _.merge({}, data, {page: fm.attributes}),
        content: fm.body,
        info: path.parse(file),
        haveAttributes: !_.isEmpty(fm.attributes)
      }
    } catch (err) {
      throw err
    }
  }

  function _processMarkdown (file) {
    if (/\.md|\.mdown|\.markdown/.test(file.info.ext)) {
      const render = new marked.Renderer()
      render.text = text => unescape(text)
      file.content = flags.escapeMarkdown ? marked(file.content) : marked(file.content, {renderer: render})
      return file
    }
    return file
  }

  function _wrapLayout (file, useBlock) {
    if (_.has(file.data, 'page.layout')) {
      const canUseBlock = _.has(file.data, 'page.useBlock') ? file.data.page.useBlock : flags.useBlock
      const extendLayout = `{% extends "${file.data.page.layout}.njk" %}`
      const extendBlock = `{% block content %}${file.content}{% endblock %}`
      file.content = `${extendLayout} ${canUseBlock ? extendBlock : file.content}`
      return file
    } else if (file.haveAttributes) {
      throw Error(`No layout declared in front-matter or data`)
    }
    return file
  }

  function _renderTemplate (file) {
    const compile = new nunjucks.Environment(new nunjucks.FileSystemLoader(flags.t))
    try {
      fs.lstatSync(flags.o).isDirectory()
    } catch (err) {
      fs.mkdirSync(path.resolve(flags.o))
    }
    try {
      file.content = compile.renderString(file.content, file.data)
    } catch (err) {
      throw Error(`Error rendering ${file.info.base} \n ${err}`)
    }
    return file
  }

  function _writeFile (file) {
    try {
      if (flags.m) {
        file.content = minify(file.content, {collapseWhitespace: true})
      }
      if (flags.c || file.data.page.clean) {
        try {
          fs.lstatSync(path.join(path.resolve(flags.o), file.info.name))
        } catch (err) {
          fs.mkdirSync(path.join(path.resolve(flags.o), file.info.name))
        }
        fs.writeFileSync(path.join(flags.o, file.info.name, 'index.html'), file.content)
      } else {
        fs.writeFileSync(path.join(flags.o, `${file.info.name}.html`), file.content)
      }
    } catch (err) {
      throw Error(`Error writing ${file.info.name} \n ${err}`)
    }
    return `${file.info.name}.html`
  }
}
