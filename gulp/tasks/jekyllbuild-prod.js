var gulp        = require('gulp');
var browserSync = require('browser-sync');
var cp          = require("child_process");
var config      = require('../config').basePaths;

/*-------------------------------------------------------------------
Jekyll build
-------------------------------------------------------------------*/
gulp.task("jekyll-build-prod", function (done) {
    return cp.spawn("bundle", ["exec", "jekyll", "build", "--config", config.html.base+"_config.yml"], {stdio: "inherit"})
    .on("close", done);
});
