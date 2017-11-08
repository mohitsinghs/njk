# njk

> Cli tool to render nunjucks templates with markdown.

[![Build Status](https://travis-ci.org/mohitsinghs/njk.svg)](https://travis-ci.org/mohitsinghs/njk)
[![npm](https://badge.fury.io/js/njk.svg)](http://badge.fury.io/js/njk)
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

  CLI tool to compile nunjucks with markdown and front-matter.

  Usage
    njk <dirs|files|globs>

  Options
    --data, -d                JSON data
    --template, -t            Template folder
    --use-block, -b           Content block in files
    --escape-markdown, -e     Escape markdown
    --out, -o                 Output folder

    If no option is passed, current directory is used

  Examples
    njk page.njk -d data.json -t templates
    njk pages -d data -t templates
```