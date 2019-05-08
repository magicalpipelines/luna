const gulp = require('gulp');
const browserSync = require('browser-sync');
const cp = require("child_process");
const config = require('../config').basePaths;

var messages = {
    jekyllBuild: '<span style="background: green; color: white; ">Building Jekyll site</span>'
};


/*-------------------------------------------------------------------
Jekyll build
-------------------------------------------------------------------*/
gulp.task("jekyll-build", function (done) {
	 browserSync.notify(messages.jekyllBuild);
    return cp.spawn("bundle", ["exec", "jekyll", "build", "--config", config.html.base+"_config-dev.yml"], {stdio: "inherit"})
    .on("close", done);
});
