const path = require('path')
const fs = require('fs-extra')
const { gzipSync } = require('zlib')
const logger = require('./logger')
const globby = require('globby').sync

/**
 * Type of paths passed as arguments
 * @type {object}
 */
const pathtype = {
  SOURCES: 'sources',
  TEMPLATES: 'templates',
}

/**
 * Filter all existing files
 * @param  {object} files files to be added
 * @param  {string} pathtype  pathtype of files for logging
 * @return {object}       filtered list
 */
const getExisting = (files, pathtype) => {
  if (files && files.length) {
    return files.map((file) => path.resolve(file)).filter(fs.existsSync)
  } else {
    logger.warn(`Using current directory for ${pathtype}`)
    return [process.cwd()]
  }
}

/**
 * Check if a file is inside one of the folders of a list
 * @param  {string} file file to check existence
 * @param  {object} list list of paths to look inside
 * @return {string}      path containing file
 */
const isInside = (file, list) => {
  const _file = path.resolve(file)
  let parent = false
  list.forEach((item) => {
    if (_file.includes(item)) {
      parent = parent && item.includes(parent) ? parent : item
    }
  })
  return parent
}

/**
 * Convert gzip file size to human readable format
 * @param  {string} file file to calculate size for
 * @return {string}      human readable size
 */
const humanSize = (file) => {
  const size = gzipSync(fs.readFileSync(file, 'utf8')).length
  if (size >> 20) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  }
  if (size >> 10) {
    return `${(size / 1024).toFixed(2)} KB`
  }
  return `${size} B`
}

/**
 * convert time difference of `process.hrtime` to human readable time
 * @param  {object} td time difference of `process.hrtime`
 * @return {string}    human readable time
 */
const humanTime = (td) => {
  if (td[0]) {
    return `${(td[0] + td[1] / 1e9).toFixed(2)}s`
  }
  return `${(td[1] / 1e6).toFixed(2)}ms`
}

/**
 * Check if given path is is a file
 * @param {string} f path
 */
const isFile = (f) => fs.lstatSync(f).isFile()

/**
 * Check if given path is is a directory
 * @param {string} f path
 */
const isDirectory = (f) => fs.lstatSync(f).isDirectory()

/**
 * Get all files and their parent directories
 * from arguments passed
 * @param {string} args cli arguments to parse
 *
 * @return {[files, rootPaths]} args
 */
const getPaths = (args) => {
  const files = getExisting(globby(args, { absolute: true }), pathtype.SOURCES)
  const rootPaths = files.map((f) => (isDirectory(f) ? f : path.dirname(f)))
  return [files, rootPaths]
}

/**
 *  Get template paths from template argument
 * @param {string} template
 *
 * @return {Array} template paths
 */
const getTemplates = (template) =>
  getExisting(
    globby(template, { absolute: true }),
    pathtype.TEMPLATES
  ).map((f) => (isDirectory(f) ? f : path.dirname(f)))

module.exports = {
  pathtype,
  getExisting,
  isInside,
  humanSize,
  humanTime,
  isFile,
  isDirectory,
  getPaths,
  getTemplates,
}
