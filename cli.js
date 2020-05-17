#!/usr/bin/env node
const path = require('path')
const cli = require('commander')
const chokidar = require('chokidar')
const chalk = require('chalk')
const logger = require('./lib/logger')
const getData = require('./lib/get-data')
const { isInside, getPaths, getTemplates } = require('./lib/utils')
const api = require('./')

cli
  .version(
    chalk`
    {yellow njk}: ${require('./package.json').version}
    {yellow nunjucks}: 3.2.1
  `
  )
  .arguments('<files|dirs|globs>')
  .usage(chalk`{green <files|dirs|globs>} [options]`)
  .option('-v, --verbose', 'print additional log')
  .option('-b, --block', 'wrap a content block in files')
  .option('-c, --clean', 'use clean urls for output files')
  .option('-q, --quiet', 'silence output until error ocours')
  .option('-w, --watch', 'watch for file changes\n')
  .option('-d, --data <file|dir>', 'JSON data or JSON/yaml directory')
  .option(
    '-t, --template <dirs>',
    'Template directories (same as searchPaths)\n',
    (t) => t.split(',')
  )
  .option('-o, --out <dir>', 'Output directory', 'dist')
  .on('--help', () => {
    console.log(chalk`
    Having troubles ? Just file an issue:
    {cyan https://github.com/mohitsinghs/njk/issues/new}
    `)
  })
  .parse(process.argv)

const [files, rootPaths] = getPaths(cli.args)
const templates = getTemplates(cli.template)

const opts = {
  verbose: cli.verbose,
  block: cli.block,
  clean: cli.clean,
  quiet: cli.quiet,
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
    sortClassName: true,
  },
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
    ignoreInitial: true,
  })
  watcher.on('change', (file) => {
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
