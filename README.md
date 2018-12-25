<h1 align="center">njk</h1>

<p align="center">
  <a href="https://travis-ci.com/mohitsinghs/njk"><img src="https://travis-ci.com/mohitsinghs/njk.svg" alt="Build Status"></a>
  <a href="https://www.npmjs.com/package/njk"><img src="https://img.shields.io/npm/v/njk.svg" alt="npm version"></a>
  <a href="https://david-dm.org/mohitsinghs/njk"><img src="https://david-dm.org/mohitsinghs/njk/status.svg" alt="dependencies Status"></a>
  <a href="https://david-dm.org/mohitsinghs/njk?type=dev"><img src="https://david-dm.org/mohitsinghs/njk/dev-status.svg" alt="devDependencies Status"></a>
  <a href="https://standardjs.com"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="code style - standard"></a>
  <a href="https://github.com/mohitsinghs/njk/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-brightgreen.svg" alt="license MIT"></a>
</p>

<p align="center">
  <b>Render nunjucks templates with markdown and front-matter</b><br/>
  <sub>generate ( and minify ) html based on nunjucks templates, markdown, front-matter and json/yml data</sub>
</p>

<br />

## Install

Install with [npm](https://npm.im/njk)

```console
npm i -g njk
```

## CLI Options

```console
$ njk --help

  Usage: njk <files|dirs|globs> [options]

  Options:

    -V, --version          output the version number
    -v, --verbose          print additional log
    -b, --block            wrap a content block in files
    -c, --clean            use clean urls for output files
    -w, --watch            watch for file changes

    -d, --data <file|dir>  JSON data or yaml directory
    -t, --template <dirs>  Template directories

    -o, --out <dir>        Output directory (default: dist)
    -h, --help             output usage information

    Having troubles ? Just file an issue:
    https://github.com/mohitsinghs/njk/issues/new
```

## File Options

Following options can be configured through front-matter of individual files.

- **`block`** Wraps a content block around a page. If enabled, an empty content block is required in parent template where content will be inserted.
- **`clean`** Uses clean urls while writing files. For example `file.html` will be written as `file/index.html`

## Additional Notes

  - **passing multiple template directories** - Multiple template directories can be passed, seperated by comma `,`
  - **html minification** - HTML is minifed by default except in watch mode.
