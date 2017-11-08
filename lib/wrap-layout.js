const _ = require('lodash')

module.exports = (file, useBlock) => {
  if (_.has(file.data, 'page.layout')) {
    const canUseBlock = _.has(file.data, 'page.useBlock') ? file.data.page.useBlock : useBlock
    const extendLayout = `{% extends "${file.data.page.layout}.njk" %}`
    const extendBlock = `{% block content %}${file.content}{% endblock %}`
    file.content = `${extendLayout} ${canUseBlock ? extendBlock : file.content}`
    return file
  } else if (file.haveAttributes) {
    return new Error(`Error processing ${file.name} \nNo layout declared in front-matter or data`)
  }
}
