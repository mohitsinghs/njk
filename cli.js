#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const cli = require('commander')
const chokidar = require('chokidar')
const chalk = require('chalk')
const logger = require('./lib/logger')
const getData = require('./lib/get-data')
const globby = require('globby').sync
const { isInside, getExisting, pathtype } = require('./lib/utils')
const api = require('./')

cli
  .version(
    chalk`
    {yellow njk}: ${require('./package.json').version}
    {yellow nunjucks}: ${require('nunjucks/package.json').version}
  `
  )
  .arguments('<files|dirs|globs>')
  .usage(chalk`{green <files|dirs|globs>} [options]`)
  .option('-v, --verbose', 'print additional log')
  .option('-b, --block', 'wrap a content block in files')
  .option('-c, --clean', 'use clean urls for output files')
  .option('-w, --watch', 'watch for file changes\n')
  .option('-d, --data <file|dir>', 'JSON data or JSON/yaml directory')
  .option(
    '-t, --template <dirs>',
    'Template directories (same as searchPaths)\n',
    t => t.split(',')
  )
  .option('-o, --out <dir>', 'Output directory', 'dist')
  .on('--help', () => {
    console.log(chalk`
    Having troubles ? Just file an issue:
    {cyan https://github.com/mohitsinghs/njk/issues/new}
    Or look at some examples:
    {cyan https://github.com/mohitsinghs/njk/wiki}
    `)
  })
  .parse(process.argv)

// list of files to process
const files = getExisting(
  globby(cli.args, { absolute: true }),
  pathtype.SOURCES
)
// list rootPaths for files and directories
const rootPaths = files.map(f =>
  fs.lstatSync(f).isDirectory() ? f : path.dirname(f)
)

const templateFiles = getExisting(
  globby(cli.template, { absolute: true }),
  pathtype.TEMPLATES
)
const templates = templateFiles.map(f =>
  fs.lstatSync(f).isDirectory() ? f : path.dirname(f)
)

const opts = {
  verbose: cli.verbose,
  block: cli.block,
  clean: cli.clean,
  data: getData(cli.data),
  rootPaths,
  templates,
  out: cli.out,
  watch: cli.watch,
  minify: !cli.watch,
  minifyOpts: {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    decodeEntities: true,
    keepClosingSlash: true,
    sortAttributes: true,
    sortClassName: true
  }
}

api(files, opts)

// list of files and directories to watch
const watchList = []

if (cli.watch) {
  watchList.push(...templates, ...rootPaths)
  // set up watcher and watch for file chanegs
  logger.log('Running in watch mode')
  const watcher = chokidar.watch(watchList, {
    ignored: /(^|[/\\])\../,
    ignoreInitial: true
  })
  watcher.on('change', file => {
    if (isInside(file, templates)) {
      // if a template is changed render everything again
      logger.log(
        chalk`Changed template {yellow ${path.relative(process.cwd(), file)}}`
      )
      api(files, opts)
    } else if (
      /\.njk|\.html|\.md|\.mdown|\.markdown/.test(path.extname(file))
    ) {
      // if a file is changed render that file
      logger.log(chalk`Changed {yellow ${path.relative(process.cwd(), file)}}`)
      api(file, opts)
    }
  })
}
