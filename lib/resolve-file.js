const frontMatter = require('front-matter')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')

module.exports = (file, data) => {
  const fm = frontMatter(fs.readFileSync(path.resolve(file)).toString())
  return {
    data: _.merge({}, data, {page: fm.attributes}),
    content: fm.body,
    info: path.parse(file),
    haveAttributes: !_.isEmpty(fm.attributes)
  }
}
