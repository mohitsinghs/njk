# njk
[![Build Status](https://travis-ci.org/mohitsinghs/njk.svg)](https://travis-ci.org/mohitsinghs/njk)
[![npm](https://badge.fury.io/js/njk.svg)](http://badge.fury.io/js/njk)
[![dependencies](https://david-dm.org/mohitsinghs/njk/status.svg)](https://david-dm.org/mohitsinghs/njk)
[![devDependencies](https://david-dm.org/mohitsinghs/njk/dev-status.svg)](https://david-dm.org/mohitsinghs/njk?type=dev)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![license MIT](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://github.com/mohitsinghs/njk/blob/master/LICENSE)
> DRY config for static sites with gulp and nunjucks

## Install

Install with [npm](https://npm.im/njk)

```
npm i -D njk
```

## Usage
Install [gulp](https://npm.im/gulp)
and create `gulpfile.js`

```js
const gulp = require('gulp')
require('njk')(gulp)
```

and a create `njk.yml`

```yaml
---
# default options for njk plugin

# task images
images :
  src:
    - app/images/**/*.{svg,png,jpg,gif}
  imagemin:
    gifsicle:
      interlaced : true
    jpegtran :
      progressive : true
    optipng :
      optimizationLevel : 7
    svgo:
      plugins:
        - removeViewBox : false
  dest : dist/images/

# task svg
svg :
  src : app/images/svg-icons/**/*.svg
  dest : app/layouts

# task styles
styles :
  src : app/styles/main.scss
  sass :
    precision: 10,
    includePaths: ['.']
  autoprefixer :
    browsers:
      - "> 1%"
      - last 2 versions
      - Firefox ESR
  outfile: main.css
  csso :
    comments : false
  dest : dist/assets

# task scripts
scripts:
  src:
    - app/scripts/**/*.js
  outfile: main.js
  uglify:
  dest: dist/assets

# task pages
pages :
  src:
    - app/pages/**/*.{njk,md,html}
  nunjucks:
    path: app/layouts
    data: app/data.json
  dest: dist

# task seo
seo:
  src: dist/**/*.html
  url: https://example.com
  critical:
    base : dist
    inline : true
    minify : true
    css : dist/assets/main.css
  htmlmin:
    collapseWhitespace : true
    removeComments : true
  dest : dist

extras:
  - app/robots.txt

# task serve
watch:
  browserSync:
    notify: false,
    server:
      baseDir: dist
  scripts: app/scripts/**/*.js
  styles: app/styles/**/*.scss
  pages:
    - app/pages/**/*.{njk,md,html}
    - app/layouts/**/*.njk
    - app/data.json
  images:
    - app/images/**/*.{svg,png,jpg}

# task deploy
deploy:
  repo : username/reponame
  branch: gh-pages

# task build
build:
  dir: dist
  dest: dist/**/*
```

Now modify `njk.yml` according to your needs.
You can add your own tasks too.

### Predefined Tasks

```
  ├─┬ build
  │ ├─┬ seo
  │ │ └─┬ html
  │ │   ├── styles
  │ │   ├── scripts
  │ │   └── svg
  │ ├── images
  │ └── extras
  ├── clean
  ├── default
  ├── deploy
  ├── extras
  ├─┬ html
  │ ├── styles
  │ ├── scripts
  │ └── svg
  ├── images
  ├── scripts
  ├─┬ seo
  │ └─┬ html
  │   ├── styles
  │   ├── scripts
  │   └── svg
  ├── serve
  ├── styles
  └── svg
```
