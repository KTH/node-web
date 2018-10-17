'use strict'
const gulp = require('gulp')

const globals = {
  dirname: __dirname
}

const { webpack, sass, vendor, clean } = require('kth-node-build-commons').tasks(globals)

/**
 * Usage:
 *
 *  One-time build of browser dependencies for development
 *
 *    $ gulp build:dev
 *
 *  Continuous re-build during development
 *
 *    $ gulp watch
 *
 *  One-time build for Deployment (Gulp tasks will check NODE_ENV if no option is passed)
 *
 *    $ gulp build [--production | --reference]
 *
 *  Remove the generated files
 *
 *    $ gulp clean
 *
 **/

// *** JavaScript helper tasks ***
gulp.task('webpack', webpack)
gulp.task('vendor', vendor)

// *** Sass ***/
gulp.task('transpileSass', sass)

/* Put any additional helper tasks here */

/**
 *
 *  Public tasks used by developer:
 *
 */

gulp.task('clean', clean)

gulp.task('build', gulp.series('vendor', 'webpack', 'transpileSass'))

gulp.task('watch', gulp.series('build', () => {
  gulp.watch('./public/js/app/**/*.js', gulp.series('webpack'))
  gulp.watch('./public/js/vendor.js', gulp.series('vendor'))
  gulp.watch('./public/css/**/*.scss', gulp.series('transpileSass'))
}))
