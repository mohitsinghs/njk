const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const ora = require('ora')
const frontMatter = require('front-matter')
const marked = require('marked')
const nunjucks = require('nunjucks')

module.exports = (files, data, flags) => {
  if (Array.isArray(files)) {
    files.forEach(file => {
      _processFile(file)
    })
  } else {
    _processFile(files)
  }

  function _processFile (file) {
    let spinner = ora(`Processing ${path.parse(file).base}`).start()
    return _resolveFile(file)
      .then(file => _processMarkdown(file))
      .then(file => _wrapLayout(file))
      .then(file => _renderTemplate(file))
      .then(result => spinner.succeed(`Written ${result}`))
      .catch(err => {
        spinner.fail(err)
        process.exit(1)
      })
  }

  function _resolveFile (file) {
    return new Promise((resolve, reject) => {
      try {
        const fm = frontMatter(fs.readFileSync(path.resolve(file)).toString())
        resolve({
          data: _.merge({}, data, {page: fm.attributes}),
          content: fm.body,
          info: path.parse(file),
          haveAttributes: !_.isEmpty(fm.attributes)
        })
      } catch (err) {
        reject(err)
      }
    })
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
      const result = compile.renderString(file.content, file.data)
      fs.writeFileSync(path.join(flags.o, `${file.info.name}.html`), result)
    } catch (err) {
      throw Error(`Error rendering ${file.info.base} \n ${err}`)
    }
    return file.info.base
  }
}
