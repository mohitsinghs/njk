const path = require('path')
const chalk = require('chalk')
const logger = require('./logger')
const { humanSize, humanTime } = require('./utils')

module.exports = (results, opts, time) => {
  // print results for various modes
  Promise.all(results).then(results => {
    const timelog = process.hrtime(time)
    // watch mode without verbose
    if (opts.watch && !opts.verbose) {
      console.log(
        chalk`Wrote {yellow ${results.length}} file(s) in {dim ${humanTime(
          timelog
        )}}`
      )
    }
    // build mode without verbose
    if (!opts.watch && !opts.verbose) {
      console.log(
        chalk`\n✨ Wrote {yellow ${results.length}} file(s) in {dim ${humanTime(
          timelog
        )}}`
      )
    }
    // watch mode with verbose
    if (opts.watch && opts.verbose) {
      results.forEach(res => {
        logger.success(chalk`Wrote {yellow ${path.relative(opts.out, res)}}`)
      })
    }
    // build mode with verbose
    if (!opts.watch && opts.verbose) {
      console.log(chalk`\n{green Rendered in} {dim ${humanTime(timelog)}}`)
      results = results.map(res => ({
        name: res,
        size: humanSize(res)
      }))
      const largest = Math.max.apply(null, results.map(res => res.size.length))
      console.log('\nFile sizes after gzip: \n')
      results
        .sort((a, b) => a.size.length - b.size.length)
        .forEach(res => {
          console.log(
            chalk`  {dim ${res.size}} ${' '.repeat(
              largest - res.size.length
            )} {cyan ${res.name}}`
          )
        })
    }
  })
}
