const log = require('log-symbols')

module.exports.fail = (msg, err) => {
  console.error(`${log.error} ${msg} \n ${err.stack || ''}`)
  process.exit(1)
}

module.exports.success = (msg) => {
  console.log(`${log.success} ${msg}`)
}

module.exports.warn = (msg) => {
  console.log(`${log.warning} ${msg}`)
}

module.exports.log = (msg) => {
  console.log(`${log.info} ${msg}`)
}
