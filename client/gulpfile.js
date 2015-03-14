var gulp       = require('gulp');
var gutil      = require('gulp-util');
var sass       = require('gulp-sass');
var browserify = require('gulp-browserify');
var babelify   = require('babelify');
var connect    = require('gulp-connect');

gulp.task('js', function () {
  return gulp.src("js/main.js")
    .pipe(browserify({
        transform: [babelify],
        debug: false
    }).on('error', gutil.log))
    .pipe(gulp.dest('./public'));
});

gulp.task('sass', function () {
  return gulp.src('styles/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./public'));
});

gulp.task('default', function() {
  gulp.watch('js/*.js', ['js']);
  gulp.watch('styles/*.scss', ['sass']);
  connect.server({
    root: 'public',
    port: 8001
  });
});
