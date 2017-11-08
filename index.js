const ora = require('ora')
const resolve = require('./lib/resolve-file')
const wrap = require('./lib/wrap-layout')
const render = require('./lib/render-template')
const md = require('./lib/process-markdown')

module.exports = (files, data, flags) => {
  let spinner = ora(`Preparing`).start()
  files.forEach(file => {
    spinner.text = `Processing ${file}`
    Promise
    .resolve(file)
    .then(file => resolve(file, data))
    .then(file => md(file, flags.escapeMarkdown))
    .then(file => wrap(file, flags.useBlock))
    .then(file => render(file, flags.out, flags.template))
    .then(name => { spinner.text = `Done ${name}` })
    .catch(err => {
      spinner.fail(`Error processing ${file}\n${err}`)
      process.exit(1)
    })
  })
  spinner.succeed(`Written ${files.length} files`)
}
