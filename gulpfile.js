var gulp = require('gulp'),
    babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify');

gulp.task('default', function () {
    return gulp.src('ursiform-client.js')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist'));
});
