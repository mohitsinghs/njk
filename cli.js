#!/usr/bin/env node
'use strict'
const fs = require('fs')
const path = require('path')
const cli = require('commander')
const log = require('log-symbols')
const dataDir = require('data-dir')
const chokidar = require('chokidar')
const njk = require('./')
const yellow = require('chalk').yellow

cli
  .version(
    `nunjucks version: ${require('nunjucks/package.json').version}
     njk version: ${require('./package.json').version}`
  )
  .usage('[options] <dirs|files|globs>')
  .option('-b, --use-block [boolean]', 'Content block in files', false)
  .option('-c, --clean [boolean]', 'Use clean urls for output files', false)
  .option('-d, --data <file|dir>', 'JSON data or yaml directory')
  .option('-e, --escape-markdown [boolean]', 'Escape markdown', false)
  .option('-m, --minify [boolean]', 'Minify output html', false)
  .option('-o, --out <directory>', 'Output directory', 'dist')
  .option('-t, --template <directory>', 'Template directory', process.cwd())
  .option('-v, --verbose [boolean]', 'Show verbose', false)
  .option('-w, --watch [boolean]', 'Watch file changes', false)
  .on('--help', () => {
    console.log(`
  Examples

    # Render all files in the current directory:
    $ njk

    # Render \`page.njk\` to \`dist/page.html\`:
    $ njk page.njk

    # Render all files in the \`pages\` directory:
    $ njk pages

    # Render all markdown files in the \`pages\` directory:
    $ njk pages/**/*.md

    # Render all files in the \`pages\` directory
    # with templates from \`templates\` directory,
    # and data from \`data.json\`:
    $ njk pages -t templates -d data.json

    # Render all files in the \`pages\` directory
    # with templates from \`templates\` directory,
    # and yaml data from \`data\` directory:
    $ njk pages -t templates -d data
    `)
  })
  .parse(process.argv)

/**
 * Get json form given directory or file. Return empty
 * data if nothing is found.
 *
 * @returns {Object}
 */
function readData () {
  if (cli.data) {
    try {
      if (fs.lstatSync(cli.data).isDirectory()) {
        return dataDir(path.resolve(cli.data))
      } else {
        return JSON.parse(fs.readFileSync(cli.data), 'utf8')
      }
    } catch (err) {
      console.error(`${log.error} Error reading data from ${cli.data}`)
      process.exit(1)
    }
  } else {
    console.log(`${log.warning} Using empty global data`)
    return {}
  }
}

// use current directory for no input. first input otherwise
let current = cli.args.length ? cli.args[0] : process.cwd()
let watchList = []

// read template directory and add to watchlist
try {
  if (fs.lstatSync(cli.template).isDirectory()) {
    watchList.push(path.resolve(cli.template))
  }
} catch (err) {
  console.log(`${log.error} Error reading template directory \n ${err}`)
  process.exit(1)
}

if (cli.args.length > 1) {
  // for multiple inputs process each file and folder
  cli.args.forEach(file => {
    watchList.push(path.resolve(file))
    njk(file, readData(), cli)
  })
} else {
  // process current directory for single input
  watchList.push(path.resolve(current))
  njk(current, readData(), cli)
}

// set up watcher for template and file changes
if (cli.watch) {
  console.log(`${log.info} Running in watch mode`)
  chokidar
    .watch(watchList, {
      ignoreInitial: true
    })
    .on('all', (event, file) => {
      if (isTemplate(file)) {
        // if a template is changed render everything again
        console.log(`${log.info} Changed template ${yellow(path.relative(process.cwd(), file))}`)
        if (cli.args.length > 1) {
          cli.args.forEach(file => njk(file, readData(), cli))
        } else {
          njk(current, readData(), cli)
        }
      } else if (/\.njk|\.html|\.md|\.mdown|\.markdown/.test(path.extname(file))) {
        // if a single file is changed render that file
        console.log(`${log.info} Changed ${yellow(path.relative(process.cwd(), file))}`)
        cli.parent = getParent(file)
        njk(file, readData(), cli)
      }
    })
}

/**
 * Get parent directory passed as input for given file.
 * Use current directory otherwise.
 *
 * @param {string} file - path of the file
 *
 * @returns {string}
 */
function getParent (file) {
  if (cli.args.length > 1) {
    cli.args.forEach(p => {
      if (file.indexOf(path.resolve(p)) !== -1) {
        return path.resolve(p)
      }
    })
  } else if (file.indexOf(path.resolve(current)) !== -1) {
    return path.resolve(current)
  }
  return process.cwd()
}

/**
 * Check if given file is inside template directory or not.
 *
 * @param {string} file - path of the file
 *
 * @returns {boolean}
 */
function isTemplate (file) {
  return path.resolve(file).indexOf(path.resolve(cli.template)) !== -1
}
