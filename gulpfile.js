var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var autoprefixer = require('autoprefixer');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var useref = require('gulp-useref');

gulp.task('serve',['sass'], function() {
    browserSync.init({
        server: {
            baseDir: "./source"
        }
    });
    gulp.watch("**/*.html").on('change', browserSync.reload);
    gulp.watch("**/js/*.js").on('change', browserSync.reload);
    gulp.watch("./source/scss/*.scss",['sass']);
});

gulp.task('sass',function(){
  return gulp.src('./source/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.init())
        .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions'] }) ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./source/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});
gulp.task('build',['min-js','copy-css','copy-image','copy-example','copy-lib']);
gulp.task('copy-lib',function(){
  return gulp.src('./source/lib/**')
          .pipe(useref())
          .pipe(gulp.dest('dist/lib'));
})
gulp.task('min-js',function(){
  return gulp.src('./source/index.html')
          .pipe(useref())
          .pipe(gulp.dest('dist'));
})
gulp.task('copy-css',function(){
  return gulp.src('./source/css/**')
        .pipe(gulp.dest('dist/css'));
})
gulp.task('copy-image',function(){
  return gulp.src('./source/images/**')
        .pipe(gulp.dest('dist/images'));
})
gulp.task('copy-example',function(){
  return gulp.src('./source/example/**')
        .pipe(gulp.dest('dist/example'));
})
gulp.task('default', ['serve']);
