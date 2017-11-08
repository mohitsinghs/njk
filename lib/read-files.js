const path = require('path')
const fs = require('fs')
const _ = require('lodash')

// returns flat array of files
function getDeepFiles (dir) {
  let result = []
  const pattern = /\.njk|\.html|\.md|\.mdown|\.markdown/
  if (fs.lstatSync(dir).isDirectory()) {
    fs.readdirSync(dir).forEach(file => {
      const current = path.resolve(dir, file)
      if (fs.lstatSync(current).isDirectory()) {
        result.push(getDeepFiles(current))
      } else if (pattern.test(path.extname(current))) {
        result.push(current)
      }
    })
  } else if (pattern.test(path.extname(dir))) {
    result.push(path.resolve(dir))
  }
  return _.flattenDeep(result)
}

// returns array of files for cli input
module.exports = input => {
  let result = []
  let current = input.length ? input[0] : process.cwd()
  if (input.length > 1) {
    input.forEach(file => result.push(getDeepFiles(file)))
  } else {
    result.push(getDeepFiles(current))
  }
  return _.flattenDeep(result)
}
