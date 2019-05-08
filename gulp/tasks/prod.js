const gulp = require('gulp');


gulp.task("prod", ["sass", "js", "jekyll-build-prod"]);