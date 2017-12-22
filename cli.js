#!/usr/bin/env node

'use strict'
const fs = require('fs')
const path = require('path')
const meow = require('meow')
const log = require('log-symbols')
const chalk = require('chalk')
const dataDir = require('data-dir')
const chokidar = require('chokidar')
const njk = require('./')

const cli = meow(`
  Usage
    njk <dirs|files|globs>

  Options
    --data, -d                JSON data
    --template, -t            Template directory
    --use-block, -b           Content block in files
    --escape-markdown, -e     Escape markdown
    --minify, -m              Minify output html
    --watch, -w               Watch file changes
    --clean, -c.              Use clean urls
    --out, -o                 Output directoty
    --verbose, -v             Show verbose

    If no option is passed, current directory is used

  Examples
    njk page.njk -d data.json -t templates
    njk pages -d data -t templates
`, {
  flags: {
    data: {
      alias: 'd',
      type: 'string'
    },
    template: {
      alias: 't',
      type: 'string',
      default: process.cwd()
    },
    useBlock: {
      alias: 'b',
      type: 'boolean'
    },
    escapeMarkdown: {
      alias: 'e',
      type: 'boolean'
    },
    minify: {
      alias: 'm',
      type: 'boolean'
    },
    watch: {
      alias: 'w',
      type: 'boolean'
    },
    'clean': {
      alias: 'c',
      type: 'boolean'
    },
    out: {
      alias: 'o',
      type: 'string',
      default: 'dist'
    },
    verbose: {
      alias: 'v',
      'type': 'boolean'
    }
  }
})

/**
 * Get json form given directory or file. Return empty
 * data if nothing is found.
 *
 * @returns {Object}
 */
function readData () {
  if (cli.flags.d) {
    try {
      if (fs.lstatSync(cli.flags.d).isDirectory()) {
        return dataDir(path.resolve(cli.flags.d))
      } else {
        return JSON.parse(fs.readFileSync(cli.flags.d))
      }
    } catch (err) {
      console.error(`${chalk.red(log.error)} Error reading data from ${cli.flags.d}`)
      process.exit(1)
    }
  } else {
    console.log(`${chalk.yellow(log.warning)} Using empty global data`)
    return {}
  }
}

// use current directory for no input. first input otherwise
let current = cli.input.length ? cli.input[0] : process.cwd()
let watchList = []

// read template directory and add to watchlist
try {
  if (fs.lstatSync(cli.flags.t).isDirectory()) {
    watchList.push(path.resolve(cli.flags.t))
  }
} catch (err) {
  console.log(`${chalk.red(log.error)} Error reading template directory \n ${err}`)
  process.exit(1)
}

if (cli.input.length > 1) {
  // for multiple inputs process each file and folder
  cli.input.forEach(file => {
    watchList.push(path.resolve(file))
    njk(file, readData(), cli.flags)
  })
} else {
  // process current directory for single input
  watchList.push(path.resolve(current))
  njk(current, readData(), cli.flags)
}

// set up watcher for template and file changes
if (cli.flags.watch) {
  console.log(`${chalk.blue(log.info)} Running in watch mode`)
  chokidar
    .watch(watchList, {
      ignoreInitial: true
    })
    .on('all', (event, file) => {
      if (isTemplate(file)) {
        // if a template is changed render everything again
        console.log(`${chalk.blue(log.info)} Changed template ${chalk.yellow(path.relative(process.cwd(), file))}`)
        if (cli.input.length > 1) {
          cli.input.forEach(file => njk(file, readData(), cli.flags))
        } else {
          njk(current, readData(), cli.flags)
        }
      } else if (/\.njk|\.html|\.md|\.mdown|\.markdown/.test(path.extname(file))) {
        // if a single file is changed render that file
        console.log(`${chalk.blue(log.info)} Changed ${chalk.yellow(path.relative(process.cwd(), file))}`)
        cli.flags.parent = getParent(file)
        njk(file, readData(), cli.flags)
      }
    })
}

/**
 * Get parent directory passed as input for given file.
 * Use current directory otherwise.
 *
 * @arg {string} file - path of the file
 *
 * @returns {string}
 */
function getParent (file) {
  if (cli.input.length > 1) {
    cli.input.forEach(p => {
      if (file.indexOf(path.resolve(p)) !== -1) {
        return path.resolve(p)
      }
    })
  } else if (file.indexOf(path.resolve(current) !== -1)) {
    return path.resolve(current)
  }
  return process.cwd()
}

/**
 * Check if given file is inside template directory or not.
 *
 * @returns {boolean}
 */
function isTemplate (file) {
  return path.resolve(file).indexOf(path.resolve(cli.flags.t)) !== -1
}
