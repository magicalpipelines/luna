/*-------------------------------------------------------------------
Paths
-------------------------------------------------------------------*/

module.exports = {
  basePaths : {
    assets: {
      src: './_assets/',
      dist: './assets/'
    },
    vendor: {
      base: './js/vendor/',
    },
    scripts: {
      src: './src/js/**/*.{js}',
      base: './src/js/',
      dist: './assets/js/'
    },
    bower: {
      base: './bower_components/',
    },
    npm: {
      base: './node_modules/',
    },
    fonts: {
      src: './_assets/fonts/'
    },
    scss: {
      src: './src/scss/**/*.{sass,scss}',
      base: './src/scss/',
      dist: './assets/css/',
    },
    html: {
      base: './',
      dist: './'
    },
    jekyll: {
      html: './**/*.html',
      posts: '_posts/*.md',
      nonsitehtml: '!_site/**/*.html'
    },
    site: {
      posts: './_posts/',
      dist: './_site/',
      css: './_site/assets/css/',
      js: './_site/assets/js/',
      images: './_site/assets/images/',
      assets: './_site/assets/',
    }
  }
};
