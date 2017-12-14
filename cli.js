#!/usr/bin/env node

'use strict'
const fs = require('fs')
const path = require('path')
const meow = require('meow')
const ora = require('ora')
const deepFiles = require('deep-files')
const dataDir = require('data-dir')
const njk = require('./')

const cli = meow(`
  Usage
    njk <dirs|files|globs>

  Options
    --data, -d                JSON data
    --template, -t            Template directory
    --use-block, -b           Content block in files
    --escape-markdown, -e     Escape markdown
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
    out: {
      alias: 'o',
      type: 'string',
      default: 'dist'
    }
  }
})

const PATTERN = /\.njk|\.html|\.md|\.mdown|\.markdown/
let current = cli.input.length ? cli.input[0] : process.cwd()
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

if (cli.input.length > 1) {
  cli.input.forEach(file => {
    njk(deepFiles(file, PATTERN), readData(), cli.flags)
  })
} else {
  njk(deepFiles(current, PATTERN), readData(), cli.flags)
}
spinner.stop()
