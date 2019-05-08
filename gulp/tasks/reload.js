const gulp = require('gulp');
const browserSync = require('browser-sync');
const config  = require('../config').basePaths;

gulp.task('bs-reload', function() {
    browserSync.reload();
});