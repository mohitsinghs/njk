const fs = require('fs')
const path = require('path')
const nunjucks = require('nunjucks')

module.exports = (file, outDir, templateDir) => {
  const compile = new nunjucks.Environment(new nunjucks.FileSystemLoader(templateDir))
  try {
    fs.lstatSync(outDir).isDirectory()
  } catch (err) {
    fs.mkdirSync(path.resolve(outDir))
  }
  try {
    const result = compile.renderString(file.content, file.data)
    try {
      fs.writeFileSync(path.join(outDir, `${file.info.name}.html`), result)
      return file.info.base
    } catch (err) {
      return err
    }
  } catch (err) {
    return err
  }
}
