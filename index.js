const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const log = require('log-symbols')
const chalk = require('chalk')
const deepFiles = require('deep-files')
const frontMatter = require('front-matter')
const marked = require('marked')
const nunjucks = require('nunjucks')
const mkdirp = require('mkdirp').sync
const minify = require('html-minifier').minify

module.exports = (input, data, flags) => {
  Promise
    .resolve(deepFiles(input, /\.njk|\.html|\.md|\.mdown|\.markdown/))
    .then(files => files
      .map(_resolveFile)
      .map(_processMarkdown)
      .map(_wrapLayout)
      .map(_renderTemplate)
      .map(_writeFile))
    .then(results => {
      if (flags.v) {
        // show detailed filenames for written files if verbose flag is passed
        results.forEach(result => console.log(`${chalk.green(log.success)} Wrote ${chalk.yellow(result)}`))
      } else {
        // show count of written files otherwise
        console.log(`${chalk.green(log.success)} Wrote ${results.length} ${results.length > 1 ? 'files' : 'file'}`)
      }
    })
    .catch(err => {
      console.log(`${chalk.red(log.error)} ${err}`)
      process.exit(1)
    })

  /**
   * Given a file path extract front-matter and return an Object
   * containing data, file contents, file info and a boolean whether
   * front-matter is present or not
   *
   * @arg {string}  file  - Source file
   *
   * @returns {Object}
   */
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

  /**
   * If file have a markdown extension then render file contents
   * and return modified file.
   *
   * @arg {Object}  file  - Source file
   *
   * @returns {Object}
   */
  function _processMarkdown (file) {
    if (/\.md|\.mdown|\.markdown/.test(file.info.ext)) {
      const render = new marked.Renderer()
      render.text = text => unescape(text)
      // escape markdown if flag is passed
      file.content = flags.escapeMarkdown ? marked(file.content) : marked(file.content, {renderer: render})
      return file
    }
    return file
  }

  /**
   * Wrap an extends tag and a content block around file contents
   * and return modified file.
   *
   * @arg {Object}  file  - Source file
   *
   * @returns {Object}
   */
  function _wrapLayout (file) {
    if (_.has(file.data, 'page.layout') && file.data.page.layout) {
      const canUseBlock = _getOpts(file.data, 'page.useBlock', flags.useBlock)
      const extendLayout = `{% extends "${file.data.page.layout}.njk" %}`
      const extendBlock = `{% block content %}${file.content}{% endblock %}`
      file.content = `${extendLayout} ${canUseBlock ? extendBlock : file.content}`
      return file
    } else if (file.haveAttributes) {
      // file have front-matter but no layout property is found
      throw Error(`No layout declared in front-matter or data for ${chalk.yellow(file.info.base)}`)
    }
    return file
  }

  /**
   * Render nunjucks template in file contents and return
   * modified file.
   *
   * @arg {Object}  file  - Source file
   *
   * @returns {Object}
   */
  function _renderTemplate (file) {
    const compile = new nunjucks.Environment(new nunjucks.FileSystemLoader(flags.t))
    try {
      file.content = compile.renderString(file.content, file.data)
    } catch (err) {
      throw Error(`Error rendering ${chalk.yellow(file.info.base)} \n ${err}`)
    }
    return file
  }

  /**
   * If an Object have an inner property with a boolean value
   * and have a global value then returns a boolean value
   * preferring inner property over global.
   *
   * @arg {Object}  src  - source object containing inner property
   * @arg {string}  key  - key of the inner property
   * @arg {boolean} prop - value of global property
   *
   * @returns {boolean}
   */
  function _getOpts (src, key, prop) {
    let propExist = _.has(src, key)
    return (propExist && src[key]) || (!propExist && prop)
  }

  /**
   * Minify html in file contents and write file to its correct location.
   *
   * @returns {string} - name of the written file
   */
  function _writeFile (file) {
    try {
      if (flags.m) {
        // minify html if flag is passed
        file.content = minify(file.content, {collapseWhitespace: true})
      }
      // for folders get relative path of file
      let dest = path.join(flags.o, path.relative(input, file.info.dir))
      if (fs.lstatSync(input).isFile()) {
        // for single file use parent directory if property found,
        // current directory otherwise
        dest = path.join(flags.o, path.relative(_.has(flags, 'parent') ? flags.parent : process.cwd(), file.info.dir))
      }
      let destfile = path.join(dest, `${file.info.name}.html`)
      if (_getOpts(file.data, 'page.clean', flags.c)) {
        // for clean urls, use filename as folder
        dest = path.join(dest, file.info.name)
        destfile = path.join(dest, 'index.html')
      }
      mkdirp(dest)
      fs.writeFileSync(destfile, file.content)
      return destfile
    } catch (err) {
      throw Error(`Error writing ${chalk.yellow(file.info.base)} \n ${err}`)
    }
  }
}
