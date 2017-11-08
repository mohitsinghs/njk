#!/usr/bin/env node

'use strict'
const meow = require('meow')
const readFiles = require('./lib/read-files')
const readData = require('./lib/read-data')
const njk = require('./')

const cli = meow(`
  Usage
    njk <dirs|files|globs>

  Options
    --data, -d                JSON data
    --template, -t            Template folder
    --use-block, -b           Content block in files
    --escape-markdown, -e     Escape markdown
    --out, -o                 Output folder

    If no option is passed, current directory is used

  Examples
    njk page.njk -d data.json -t templates
    njk pages -d data -t templates
`, {
  default: {
    template: process.cwd(),
    out: 'dist'
  },
  alias: {
    d: 'data',
    t: 'template',
    b: 'use-block',
    e: 'escape-markdown',
    o: 'out'
  }
})

njk(readFiles(cli.input), readData(cli.flags.d), cli.flags)
