const gulp = require('gulp');
const ts = require('gulp-typescript');
const merge2 = require('merge2')
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const mapSources = require('@gulp-sourcemaps/map-sources');
const uglify = require('gulp-uglify-es').default;
const rename = require("gulp-rename");
const tsProject = ts.createProject('tsconfig.json');

gulp.task('build', function() {
    const tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .js.pipe(sourcemaps.write({ addComment: false }));

    const defineJs = gulp.src('./define.js')
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write({ addComment: false }));

    merge2(defineJs, tsResult)
        .pipe(concat('solution.js'))
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(mapSources(function(sourcePath, file) {
            prefix = '/source/';
            return sourcePath.startsWith(prefix) ? sourcePath.substr(prefix.length) : sourcePath;
        }))
        .pipe(sourcemaps.write('.', { sourceRoot: '' }))
        .pipe(gulp.dest('.'));
});

gulp.task('minify', function() {
    gulp.src('./solution.js')
        .pipe(uglify({
            compress: {
                drop_debugger: true,
                drop_console: false
            }
        }))
        .pipe(rename('solution.min.js'))
        .pipe(gulp.dest('.'));
});

gulp.task('default', ['build'], function(gulpCallback) {
    gulp.watch(['./define.js', './**/*.ts', '!./node_modules/**/*.ts'], ['build']);
    gulp.watch('./solution.js', ['minify']);
});