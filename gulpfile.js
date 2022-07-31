const gulp = require('gulp');
const terser = require('gulp-terser');
const cleanCSS = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');

gulp.task('js', () => {
  return gulp.src('src/*.js')
  .pipe(terser({
    compress: {
      dead_code: true,
      drop_console: true,
      drop_debugger: true,
      keep_classnames: false,
      keep_fargs: false,
      keep_fnames: false,
      keep_infinity: false
    },
    mangle: {
      eval: true,
      keep_classnames: false,
      keep_fnames: false,
      toplevel: true,
      safari10: false,
      properties: true
    }
  }))
  .pipe(gulp.dest('build/'));
});

gulp.task('css', () => {
  return gulp.src('src/*.css')
  .pipe(cleanCSS())
  .pipe(gulp.dest('build/'));
});

gulp.task('html', () => {
  return gulp.src('src/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build/'));
});

gulp.task('default', gulp.series('js', 'css', 'html'));