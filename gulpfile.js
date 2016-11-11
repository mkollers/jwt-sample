var args = require('yargs').argv;
var config = require('./gulp.config');
var del = require('del');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')({ lazy: false });

gulp.task('default', ['build']);
gulp.task('build', ['ts']);

/**
 * lint the code and create coverage report
 * @return {Stream}
 */
gulp.task('lint', function () {
    log('Analyzing source with TSLint');

    var reporter = args.verbose ? 'verbose' : 'prose';
    return gulp
        .src(config.ts)
        .pipe($.changed(config.build, { extension: '.js' }))
        .pipe($.if(args.verbose, $.print()))
        .pipe($.tslint({
            formatter: reporter
        }))
        .pipe($.tslint.report());
});

/**
 * Transpile ts to js 
 * @return {Stream}
 */
gulp.task('ts', ['lint'], function () {
    log('Transpiling TS --> JS');

    var tsResult = gulp.src(config.ts)
        .pipe($.changed(config.build, { extension: '.js' }))
        .pipe($.if(args.verbose, $.print()))
        .pipe($.sourcemaps.init())
        .pipe($.typescript({
            removeComments: true,
            typescript: require('typescript'),
            noImplicitAny: true,
            target: "es5"
        }));

    return tsResult.js
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(config.build));
});

/**
 * Remove all js from the build folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-code', function (done) {
    var files = [].concat(
        config.build + '**/*.js',
        config.build + '**/*.js.map'
    );
    clean(files, done);
});

////////////////////////////////////////

/**
 * Delete all files in a given path
 * @param  {Array}   path - array of paths to delete
 * @param  {Function} done - callback when complete
 */
function clean(path, done) {
    log('Cleaning: ' + $.util.colors.blue(path));
    del(path).then(done());
}

/**
 * Log a message or series of messages using chalk's blue color.
 * Can pass in a string, object or array.
 */
function log(msg) {
    if (typeof (msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}