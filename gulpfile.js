var gulp = require('gulp'),
    sass = require('gulp-sass'),
    cssnano = require('gulp-cssnano'),
    htmlmin = require('gulp-htmlmin'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    fs = require('fs');

gulp.task('minifycss', function () {
     return gulp.src('src/styles/style.scss')
            .pipe(sass())
            .pipe(gulp.dest('src/styles'))
            .pipe(cssnano())
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest('build'))
});

gulp.task('minifyhtml', function () {
    return gulp.src('src/markup/markup.html')
            .pipe(htmlmin({collapseWhitespace: true}))
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest('build'))
});

gulp.task('build', ['minifyhtml', 'minifycss'], function () {
    gulp.src('src/script.js')
        .pipe(replace(/SRC_STYLE/, function (s) {
            var style = fs.readFileSync('build/style.min.css', 'utf-8');
            return style;
        }))
        .pipe(replace(/SRC_MARKUP/, function (s) {
            var markup = fs.readFileSync('build/markup.min.html', 'utf-8');
            return markup;
        }))
        .pipe(rename('twitter-profile-widget.js'))
        .pipe(gulp.dest('dist'))
        //.pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
    return gulp.watch(['src/**/*.html', 'src/**/*.scss', 'src/*.js'], ['build'])
            .on('change', function (event) {
                console.log('building...');
            });
});


gulp.task('default', ['build']);