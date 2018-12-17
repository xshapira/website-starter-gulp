let gulp = require('gulp');
let bs = require('browser-sync').create();
let postcss = require('gulp-postcss');
let tailwindcss = require('tailwindcss');
let purgecss = require('gulp-purgecss');
let autoprefixer = require('gulp-autoprefixer');
let cleanCSS = require('gulp-clean-css');
let concat = require('gulp-concat');
let rename = require('gulp-rename');
let uglify = require('gulp-uglify');
let hash = require('gulp-hash');
let references = require('gulp-hash-references');

gulp.task('css', function(){
  return gulp.src('./app/css/main.css')
  .pipe(postcss([
    tailwindcss('./tailwind.js'),
  ]))
  .pipe(purgecss({
    content: ['./app/**/*.html', './app/**/*.js'],
    extractors: [
      {
        extractor: class TailwindExtractor {
          static extract(content) {
            return content.match(/[A-Za-z0-9-_:\/]+/g) || [];
          }
        },
        extensions: ['html', 'js']
      }
    ]
  }))
  .pipe(autoprefixer({
    browsers: ['last 2 versions'],
    cascade: false
  }))
  .pipe(cleanCSS({compatibility: 'ie8'}))
  .pipe(hash())
  .pipe(gulp.dest('./dist/css/'))
  .pipe(hash.manifest('asset-manifest.json', {
    deleteOld: true,
    sourceDir: './dist/css/'
  }))
  .pipe(gulp.dest('.'));
});

gulp.task('js', function(){
  return gulp.src([
    './app/js/jquery.js',
    './app/js/plugins.js',
    './app/js/main.js'
  ])
  .pipe(concat('main.js'))
  .pipe(uglify())
  .pipe(hash())
  .pipe(gulp.dest('./dist/js/'))
  .pipe(hash.manifest('asset-manifest.json', {
    deleteOld: true,
    sourceDir: './dist/js/'
  }))
  .pipe(gulp.dest('.'));
});

gulp.task('html', function(){
  return gulp.src('./app/index.html')
  .pipe(references('asset-manifest.json'))
  .pipe(gulp.dest('./dist/'));
});

gulp.task('default', function(){
  // $ ./node_modules/.bin/gulp
  gulp.watch(['app/css/**/*.css', './tailwind.js', 'app/index.html'], gulp.series('css', 'html'));
  gulp.watch('app/js/**/*.js', gulp.series('js', 'html'));
  gulp.watch('app/index.html', gulp.series('html'));
  bs.watch('./dist/index.html').on('change', bs.reload);
  bs.init({server: { baseDir: "./dist/" }});
});
