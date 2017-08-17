const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const del = require('del')
const bs = require('browser-sync')
const gulpLoadPlugins = require('gulp-load-plugins')
const critical = require('critical')
const dataDir = require('data-dir')
const $ = gulpLoadPlugins()
const reload = bs.reload
const cs = critical.stream

module.exports = _gulp => {
  const defaults = yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'njk_defaults.yml'), 'utf8'))
  const options = _.defaultsDeep(yaml.safeLoad(fs.readFileSync('njk.yml', 'utf8')) || {}, defaults)
  const runSequence = require('run-sequence').use(_gulp)

  // Optimize Images
  _gulp.task('images', () => {
    const plugins = Object.keys(options.images.imagemin)
    const defaultPlugins = ['pngquant', 'jpegtran', 'gifsicle', 'svgo']
    let imageminOptions = []
    plugins.forEach(plugin => {
      if (_.has(defaultPlugins, plugin)) imageminOptions.push($.imagemin[plugin](options.images.imagemin[plugin]))
      else imageminOptions.push(require(`imagemin-${plugin}`)(options.images.imagemin[plugin]))
    }, this)

    return _gulp.src(options.images.src)
      .pipe($.flatten())
      .pipe($.imagemin(imageminOptions))
      .pipe(_gulp.dest(options.images.dest))
      .pipe(reload({stream: true}))
  })

  // Store SVG Images
  _gulp.task('svg', () => {
    return _gulp.src(options.svg.src)
      .pipe($.svgstore({inlineSvg: true}))
      .pipe($.cheerio({
        run: $ => {
          $('svg').attr('style', 'display:none')
        },
        parserOptions: {xmlMode: true}
      }))
      .pipe(_gulp.dest(options.svg.dest))
  })

  // Generate Styles
  _gulp.task('styles', () => {
    return _gulp.src(options.styles.src)
      .pipe($.plumber())
      .pipe($.sass(options.styles.sass).on('error', $.sass.logError))
      .pipe($.autoprefixer(options.styles.autoprefixer))
      .pipe($.concat(options.styles.outfile))
      .pipe($.csso(options.styles.csso))
      .pipe(_gulp.dest(options.styles.dest))
      .pipe(reload({stream: true}))
  })

  // Generate Scripts
  _gulp.task('scripts', () => {
    return _gulp.src(options.scripts.src)
      .pipe($.plumber())
      .pipe($.concat(options.scripts.outfile))
      .pipe($.uglify(options.scripts.uglify))
      .pipe(_gulp.dest(options.scripts.dest))
      .pipe(reload({stream: true}))
  })

  // Render Nunjuks to HTML
  _gulp.task('html', ['styles', 'scripts', 'svg'], () => {
    if (options.pages.dataDir) {
      options.pages.nunjucks.data = dataDir(options.pages.dataDir).next().value
    }
    return _gulp.src(options.pages.src)
      .pipe($.plumber())
      .pipe($.nunjucksMd(options.pages.nunjucks))
      .pipe($.rename(function (path) {
        if (path.basename !== 'index' && path.basename !== '404') {
          path.dirname += '/' + path.basename
          path.basename = 'index'
        }
      }))
      .pipe(_gulp.dest(options.pages.dest))
      .pipe(reload({stream: true}))
  })

  // Search Engine Optimization
  _gulp.task('seo', ['html'], () => {
    return _gulp.src(options.seo.src)
      .pipe($.plumber())
      .pipe($.save('sitemap-save'))
      .pipe($.sitemap({siteUrl: options.seo.url}))
      .pipe($.replace('index.html', ''))
      .pipe(_gulp.dest('dist'))
      .pipe($.save.restore('sitemap-save'))
      .pipe(cs(options.seo.critical))
      .pipe($.htmlmin(options.seo.htmlmin))
      .pipe(_gulp.dest(options.seo.dest))
  })

  _gulp.task('extras', () => {
    return _gulp.src(options.extras)
      .pipe(_gulp.dest('dist'))
  })

  // Watch file changes
  _gulp.task('serve', () => {
    return runSequence('clean', ['html', 'images'], () => {
      bs(options.watch.browserSync)
      _gulp.watch(options.watch.scripts, ['scripts'])
      _gulp.watch(options.watch.styles, ['styles'])
      _gulp.watch([options.watch.pages], ['html'])
      _gulp.watch([options.watch.images], ['images'])
    })
  })

  // Deploy to github pages
  _gulp.task('deploy', function () {
    return _gulp.src(options.build.dest)
      .pipe($.ghPages({
        remoteUrl: 'https://' + process.env.GH_TOKEN + '@github.com/' + options.deploy.repo + '.git',
        branch: options.deploy.branch
      }))
  })

  // Clean bulid directory
  _gulp.task('clean', () => {
    return del([options.build.dir])
  })

  // Build everything and show gziped size
  _gulp.task('build', ['seo', 'images', 'extras'], () => {
    return _gulp.src(options.build.dest)
    .pipe($.size({title: 'build', gzip: true}))
  })

  // Clean and build
  _gulp.task('default', () => {
    return runSequence('clean', 'build')
  })
}
