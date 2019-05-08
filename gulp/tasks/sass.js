const gulp = require('gulp');
const cssmin = require('gulp-cssmin');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const prefix = require('gulp-autoprefixer');
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const config  = require('../config');

gulp.task('sass', function() {
    gulp.src(config.basePaths.scss.src)
    .pipe(plumber())
    .on('error', function(err) {
        console.log(err.message);
    })
    .pipe(sass())
    .pipe(prefix({ browsers: ['last 2 versions'] }))
    .pipe(cssmin())
    .pipe(gulp.dest(config.basePaths.site.css))
    .pipe(browserSync.reload({
      stream: true
    }))
    .pipe(gulp.dest(config.basePaths.scss.dist))
    .pipe(browserSync.reload({
      stream: true
    }))
});
