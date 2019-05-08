import gulp from 'gulp';
import size from 'gulp-size';
import plumber from 'gulp-plumber';
import paths from '../config';
import browserSync from 'browser-sync';
const reload = browserSync.reload;
import util from 'gulp-util';
import gulpif from 'gulp-if';

import browserify from 'browserify'
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import uglify from 'gulp-uglify';

require('dotenv').config();
const isProduction = process.env.NODE_ENV === 'production';

gulp.task('js', () => {
    return browserify({ entries: paths.basePaths.scripts.base + "app.js", debug: true })
        .transform("babelify")
        .bundle()
        .on('error', (err) => {
            console.log(err.message);
        })
        .pipe(plumber())
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(gulpif(isProduction, uglify()))
        .pipe(gulp.dest(paths.basePaths.scripts.dist))
        .pipe(gulp.dest(paths.basePaths.site.js))
        .pipe(browserSync.reload({ stream: true, once: true }));
})
