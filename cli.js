#!/usr/bin/env node

'use strict'
const fs = require('fs')
const path = require('path')
const meow = require('meow')
const ora = require('ora')
const deepFiles = require('deep-files')
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
    }
  }
})

const spinner = ora('Processing').start()

function readData () {
  if (cli.flags.d) {
    try {
      if (fs.lstatSync(cli.flags.d).isDirectory()) {
        return dataDir(path.resolve(cli.flags.d))
      } else {
        return JSON.parse(fs.readFileSync(cli.flags.d))
      }
    } catch (err) {
      spinner.fail(`Error reading data from ${cli.flags.d}`)
      process.exit(1)
    }
  } else {
    spinner.warn('Using empty global data')
    return {}
  }
}

const PATTERN = /\.njk|\.html|\.md|\.mdown|\.markdown/
let current = cli.input.length ? cli.input[0] : process.cwd()
let watchList = []
watchList.push(path.resolve(cli.flags.t))
if (cli.input.length > 1) {
  cli.input.forEach(file => {
    watchList.push(path.resolve(current))
    njk(deepFiles(file, PATTERN), readData(), cli.flags)
  })
} else {
  watchList.push(path.resolve(current))
  njk(deepFiles(current, PATTERN), readData(), cli.flags)
}

if (cli.flags.watch) {
  spinner.info('Running in watch mode')
  chokidar
    .watch(watchList, {
      ignoreInitial: true
    })
    .on('all', (event, file) => {
      if (isTemplate(file)) {
        spinner.info(`Changed template ${path.relative(process.cwd(), file)}`)
        if (cli.input.length > 1) {
          cli.input.forEach(file => {
            njk(deepFiles(file, PATTERN), readData(), cli.flags)
          })
        } else {
          njk(deepFiles(current, PATTERN), readData(), cli.flags)
        }
      } else if (PATTERN.test(path.extname(file))) {
        spinner.info(`Changed ${path.relative(process.cwd(), file)}`)
        njk(file, readData(), cli.flags)
      }
    })
}

spinner.stop()

function isTemplate (file) {
  return path.resolve(file).indexOf(path.resolve(cli.flags.t)) !== -1
}
