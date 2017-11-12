var gulp = require('gulp')
var browserSync = require('browser-sync').create()
var reload = browserSync.reload
var fs = require('fs')
var file = require('gulp-file')
var uglify = require('gulp-uglify')
var minifyCss = require('gulp-minify-css')
var htmlreplace = require('gulp-html-replace')
var react = require('gulp-react')
var reactTools = require('react-tools')
var babel = require('gulp-babel')
// Static server
gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: './src'
    }
  })
})
gulp.task('browser-sync-prod', function () {
  browserSync.init({
    server: {
      baseDir: './dist'
    }
  })
})
gulp.task('init', function () {
  return gulp.src([
    'node_modules/react/dist/react.js',
    'node_modules/react/dist/JSXTransformer.js'
  ])
    .pipe(gulp.dest('src/lib'))
})
gulp.task('watch', function () {
  gulp.watch('src/index.html').on('change', browserSync.reload)
  gulp.watch('src/js/app.js').on('change', browserSync.reload)
  gulp.watch('src/css/main.css').on('change', browserSync.reload)
})
gulp.task('react-tools', function () {
  var str = fs.readFileSync('src/js/jsx/app.jsx').toString()
  var output = reactTools.transform(str, 'harmony : false')
  return file('app.min.js', output, {
    src: true
  }).pipe(react())
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
})
gulp.task('babel', function () {
  return gulp.src('src/js/jsx/app.jsx')
        .pipe(babel())
        .pipe(gulp.dest('src/js'))
})
gulp.task('css', function () {
  return gulp.src([
    'src/css/main.css'
  ]).pipe(minifyCss({
    compatibility: 'ie8'
  })).pipe(gulp.dest('dist'))
})
gulp.task('move', function () {
  return gulp.src(['node_modules/react/dist/react.min.js'])
    .pipe(gulp.dest('dist'))
})
gulp.task('replace', function () {
  gulp.src('src/index.html')
    .pipe(htmlreplace({
      'css': 'main.css',
      'js': 'react.min.js',
      'react': 'app.min.js'
    }))
    .pipe(gulp.dest('dist'))
})
gulp.task('prod', ['react-tools', 'move', 'replace', 'css', 'browser-sync-prod'])
gulp.task('default', ['init', 'babel', 'browser-sync', 'watch'])
