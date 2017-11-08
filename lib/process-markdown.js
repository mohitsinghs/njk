const marked = require('marked')

module.exports = (file, escapeMarkdown) => {
  if (/\.md|\.mdown|\.markdown/.test(file.info.ext)) {
    const render = new marked.Renderer()
    render.text = text => unescape(text)
    file.content = escapeMarkdown ? marked(file.content) : marked(file.content, {renderer: render})
    return file
  }
  return file
}
