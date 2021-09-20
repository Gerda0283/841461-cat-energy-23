const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const htmlmin = require("gulp-htmlmin"); //html-minify
const csso = require("postcss-csso") //css-minify
const rename = require("gulp-rename"); //css-minify
const squoosh = require("gulp-libsquoosh");
const svgstore = require("gulp-svgstore");
const webp = require("gulp-webp");
const terser = require("gulp-terser");
const del = require("del");
const sync = require("browser-sync").create();

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss") // style.scss
    .pipe(plumber()) // style.scss -> style.scss
    .pipe(sourcemap.init()) // [style.scss](1) -> style.scss
    .pipe(sass()) // style.scss -> style.css
    .pipe(postcss([ // style.css
      autoprefixer(), // style.css -> style.css [prefix]
      csso() //style.css [prefix, min]
    ]))
    .pipe(rename("style.min.css"))  //style.min.css [prefix, min]
    .pipe(sourcemap.write(".")) // style.css [prefix](2)
    .pipe(gulp.dest("build/css")) // style.css [prefix]
    .pipe(sync.stream());
}

exports.styles = styles;

//HTML

const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"));
}

exports.html = html;

//Scripts
const minifyScripts = () => {
  return gulp
    .src("source/js/script.js")
    .pipe(terser())
    .pipe(rename("script.min.js"))
    .pipe(gulp.dest("build/js"))
    .pipe(sync.stream());
}

exports.minifyScripts = minifyScripts;

//Images
const optimizeImages = () => {
  return gulp.src(["source/img/index/xs/*.{png,jpg}",
  "source/img/index/xs/*.{png,jpg}",
  "source/img/index/sm/*.{png,jpg}",
  "source/img/index/md/*.{png,jpg}"])
  .pipe(squoosh())
  .pipe(gulp.dest("build/img/index"));
}

exports.optimizeImages = optimizeImages;

//Backgrounds
const optimizeBgs = () => {
  return gulp.src("source/img/bg/**/*.{png,jpg}")
  .pipe(squoosh())
  .pipe(gulp.dest("build/img/bg"));
}

exports.optimizeBgs = optimizeBgs;

//Copy Images
const copyImages = () => {
  return gulp.src(["source/img/svg/*.svg",
  "source/img/favicon/*.{svg,png}"])
  .pipe(gulp.dest("build/img/icons"));
}

exports.copyImages = copyImages;

//Copy Logo
const copyLogo = () => {
  return gulp.src("source/img/logo/*.svg")
  .pipe(gulp.dest("build/img"));
}

exports.copyLogo = copyLogo;

//Webp

const createWebp = () => {
  return gulp.src(["source/img/catalog/xs/*.{png,jpg}",
  "source/img/catalog/sm/*.{png,jpg}",
  "source/img/catalog/md/*.{png,jpg}"])
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest("build/img/catalog"));
}

exports.createWebp = createWebp;

//Sprite

const sprite = () => {
  return gulp.src("source/img/icons_sprite/*.svg")
  .pipe(svgstore({inlineSvg:true}))
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img"));
}

exports.sprite = sprite;

//Copy

const copy = (done) => {
  gulp.src(["source/fonts/*.{woff2, woff}",
  "source/*.ico",
  "source/*.webmanifest",
  "!source/img"
], {
  base: "source"
})
  .pipe(gulp.dest("build"))
  done();
}
exports.copy = copy;

//Clean

const clean = () => {
  return del("build");
};

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

//Reload

const reload = (done) => {
  sync.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/js/nav.js", gulp.series("minifyScripts"));
  gulp.watch("source/*.html", gulp.series(html, reload));
}

//Build

const build = gulp.series(
  clean,
  copy,
  copyImages,
  copyLogo,
  optimizeImages,
  optimizeBgs,
  gulp.parallel (
    styles,
    html,
    minifyScripts,
    sprite,
    createWebp
  ),
);

exports.build = build;

exports.default = gulp.series(
  clean,
  copy,
  copyImages,
  copyLogo,
  optimizeImages,
  optimizeBgs,
  gulp.parallel (
    styles,
    minifyScripts,
    html,
    sprite,
    createWebp
  ),
  gulp.series (
    server,
    watcher
  )
);
