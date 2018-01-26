const fs = require('fs')
const path = require('path')
const preferLocal = require('prefer-local')
const log = require('log-symbols')
const deepFiles = require('deep-files')
const frontMatter = require('front-matter')
const marked = require('marked')
const nunjucks = require('nunjucks')
const mkdirp = require('mkdirp').sync
const minify = require('html-minifier').minify
const has = require('lodash.has')
const unescape = require('lodash.unescape')
const yellow = require('chalk').default.yellow

module.exports = (input, data, cli) => {
  Promise
    .resolve(deepFiles(input, /\.njk|\.html|\.md|\.mdown|\.markdown/))
    .then(files => files
      .map(_resolveFile)
      .map(_processMarkdown)
      .map(_wrapLayout)
      .map(_renderTemplate)
      .map(_writeFile))
    .then(results => {
      if (cli.verbose) {
        // show detailed filenames for written files if verbose flag is passed
        results.forEach(result => console.log(`${log.success} Wrote ${yellow(result)}`))
      } else {
        // show count of written files otherwise
        console.log(`${log.success} Wrote ${results.length} ${results.length > 1 ? 'files' : 'file'}`)
      }
    })
    .catch(err => {
      console.log(`${log.error} ${err}`)
      process.exit(1)
    })

  /**
   * Given a file path extract front-matter and return an Object
   * containing data, file contents, file info and a boolean whether
   * front-matter is present or not
   *
   * @param {string}  file  - Source file
   *
   * @returns {Object}
   */
  function _resolveFile (file) {
    try {
      const fm = frontMatter(fs.readFileSync(path.resolve(file)).toString())
      return {
        data: Object.assign({}, data, {page: fm.attributes}),
        content: fm.body,
        info: path.parse(file),
        haveAttributes: Object.keys(fm.attributes).length
      }
    } catch (err) {
      throw err
    }
  }

  /**
   * If file have a markdown extension then render file contents
   * and return modified file.
   *
   * @param {Object}  file  - Source file
   *
   * @returns {Object}
   */
  function _processMarkdown (file) {
    if (/\.md|\.mdown|\.markdown/.test(file.info.ext)) {
      const render = new marked.Renderer()
      render.text = text => unescape(text)
      // escape markdown if flag is passed
      file.content = cli.escapeMarkdown ? marked(file.content) : marked(file.content, {renderer: render})
      return file
    }
    return file
  }

  /**
   * Wrap an extends tag and a content block around file contents
   * and return modified file.
   *
   * @param {Object}  file  - Source file
   *
   * @returns {Object}
   */
  function _wrapLayout (file) {
    if (preferLocal(file.data, 'page.layout')) {
      const canUseBlock = preferLocal(file.data, 'page.useBlock', cli.useBlock)
      const extendLayout = `{% extends "${file.data.page.layout}.njk" %}`
      const extendBlock = `{% block content %}${file.content}{% endblock %}`
      file.content = `${extendLayout} ${canUseBlock ? extendBlock : file.content}`
      return file
    } else if (file.haveAttributes) {
      // file have front-matter but no layout property is found
      throw Error(`No layout declared in front-matter or data for ${yellow(file.info.base)}`)
    }
    return file
  }

  /**
   * Render nunjucks template in file contents and return
   * modified file.
   *
   * @param {Object}  file  - Source file
   *
   * @returns {Object}
   */
  function _renderTemplate (file) {
    const compile = new nunjucks.Environment(new nunjucks.FileSystemLoader(cli.template))
    try {
      file.content = compile.renderString(file.content, file.data)
    } catch (err) {
      throw Error(`Error rendering ${yellow(file.info.base)} \n ${err}`)
    }
    return file
  }

  /**
   * Minify html in file contents and write file to its correct location.
   *
   * @returns {string} - name of the written file
   */
  function _writeFile (file) {
    try {
      if (cli.minify) {
        // minify html if flag is passed
        file.content = minify(file.content, {collapseWhitespace: true})
      }
      // for folders get relative path of file
      let dest = path.join(cli.out, path.relative(input, file.info.dir))
      if (fs.lstatSync(input).isFile()) {
        // for single file use parent directory if property found,
        // current directory otherwise
        dest = path.join(cli.out, path.relative(has(cli, 'parent') ? cli.parent : process.cwd(), file.info.dir))
      }
      let destfile = path.join(dest, `${file.info.name}.html`)
      if (preferLocal(file.data, 'page.clean', cli.clean)) {
        // for clean urls, use filename as folder
        dest = path.join(dest, file.info.name)
        destfile = path.join(dest, 'index.html')
      }
      mkdirp(dest)
      fs.writeFileSync(destfile, file.content)
      return destfile
    } catch (err) {
      throw Error(`Error writing ${yellow(file.info.base)} \n ${err}`)
    }
  }
}
