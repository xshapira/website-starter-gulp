let gulp = require('gulp');
let browserSync = require('browser-sync').create();
let postcss = require('gulp-postcss');
let tailwindcss = require('tailwindcss');
let purgecss = require('gulp-purgecss');
let autoprefixer = require('gulp-autoprefixer');
let cleanCSS = require('gulp-clean-css');
let concat = require('gulp-concat');
let rename = require('gulp-rename');
let uglify = require('gulp-uglify');

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
    .pipe(gulp.dest('./dist/css/'))
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('js', function(){
  return gulp.src([
    './app/js/jquery.js',
    './app/js/plugins.js',
    './app/js/main.js'
  ])
  .pipe(concat('main.js'))
  .pipe(uglify())
  .pipe(gulp.dest('./dist/js/'))
  .pipe(browserSync.reload({stream:true}));
});

gulp.task('html', function(){
  return gulp.src('./app/index.html')
  .pipe(gulp.dest('./dist/'))
  .pipe(browserSync.reload({stream:true}));
});

gulp.task('watch', function(){
  // ./node_modules/.bin/gulp watch
  browserSync.init({server: { baseDir: "./dist/" }});
  gulp.watch('app/css/**/*.css', ['css']);
  gulp.watch('./tailwind.js', ['css']);
  gulp.watch('app/js/**/*.js', ['js']);
  gulp.watch('app/**/*.html', ['html']);
});