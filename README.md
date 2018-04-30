# njk

> Cli tool to render nunjucks templates with markdown and front-matter.

[![Build Status](https://travis-ci.org/mohitsinghs/njk.svg)](https://travis-ci.org/mohitsinghs/njk)
[![npm](https://badge.fury.io/js/njk.svg)](http://badge.fury.io/js/njk)
[![dependencies Status](https://david-dm.org/mohitsinghs/njk/status.svg)](https://david-dm.org/mohitsinghs/njk)
[![devDependencies Status](https://david-dm.org/mohitsinghs/njk/dev-status.svg)](https://david-dm.org/mohitsinghs/njk?type=dev)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![license MIT](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://github.com/mohitsinghs/njk/blob/master/LICENSE)

## Install

Install with [npm](https://npm.im/njk)

```console
npm i -g njk
```

## Uses

```console
$ njk --help

  Usage: njk [options] <dirs|files|globs>


  Options:

    -V, --version                    output the version number
    -b, --use-block [boolean]        Content block in files (default: false)
    -c, --clean [boolean]            Use clean urls for output files (default: false)
    -d, --data <file|dir>            JSON data or yaml directory
    -e, --escape-markdown [boolean]  Escape markdown (default: false)
    -m, --minify [boolean]           Minify output html (default: false)
    -o, --out <directory>            Output directory (default: dist)
    -t, --template <directory>       Template directory (default: cwd)
    -v, --verbose [boolean]          Show verbose (default: false)
    -w, --watch [boolean]            Watch file changes (default: false)
    -h, --help                       output usage information

  Examples

    # Render all files in the current directory:
    $ njk

    # Render `page.njk` to `dist/page.html`:
    $ njk page.njk

    # Render all files in the `pages` directory:
    $ njk pages

    # Render all markdown files in the `pages` directory:
    $ njk pages/**/*.md

    # Render all files in the `pages` directory
    # with templates from `templates` directory,
    # and data from `data.json`:
    $ njk pages -t templates -d data.json

    # Render all files in the `pages` directory
    # with templates from `templates` directory,
    # and yaml data from `data` directory:
    $ njk pages -t templates -d data
```

### File Level Options
Following options can be configured through front-matter of individual files.
 - __`useBlock`__ Wraps a content block around a page. If enabled, an empty content block is required in parent template where content will be inserted.
 - __`clean`__ Uses clean urls while writing files. For example `file.html` will be written as `file/index.html`
