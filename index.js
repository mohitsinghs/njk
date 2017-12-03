const path = require('path')
const ora = require('ora')
const resolve = require('./lib/resolve-file')
const wrap = require('./lib/wrap-layout')
const render = require('./lib/render-template')
const md = require('./lib/process-markdown')

module.exports = (files, data, flags) => {
  files.forEach(file => {
    let spinner = ora(`Processing ${file}`).start()
    Promise
    .resolve(file)
    .then(file => resolve(file, data))
    .then(file => md(file, flags.escapeMarkdown))
    .then(file => wrap(file, flags.useBlock))
    .then(file => render(file, flags.out, flags.template))
    .then(name => spinner.succeed(`Done ${name}`))
    .catch(err => {
      spinner.fail(`Error processing ${path.parse(file).base}\n${err}`)
      process.exit(1)
    })
  })
}
