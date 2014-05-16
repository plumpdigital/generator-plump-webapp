
var gulp = require('gulp'),
	gutil = require('gulp-util');

//requires

var express = require('express'),
	open = require('open');

//plugin requires

var concat       = require('gulp-concat'),
	uglify       = require('gulp-uglify'),
	jshint       = require('gulp-jshint'),
	rename       = require('gulp-rename'),
	swig         = require('gulp-swig'),
	sass         = require('gulp-ruby-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	minifycss    = require('gulp-minify-css'),
	imagemin     = require('gulp-imagemin'),
	cache        = require('gulp-cache'),
	clean        = require('gulp-clean'),
	livereload   = require('gulp-livereload');

/**
 * Constants
 */

var DIST_SERVER_PORT = 9001;
var DEV_SERVER_PORT = 9000;
var LIVERELOAD_PORT = 35729;

/**
 *    Script build task. Combines and uglifies JS, producing
 *    both a minified and non-minified version in dist/ and
 *    dev/ respectively.
 * 
 * 1. Using all .js files in /src/scripts
 * 2. Combine into main.js
 * 3. Output development version to dev/js
 * 4. Rename to main.min.js
 * 5. Uglify to minify.
 * 6. Output minified version to dist/js
 */
gulp.task('scripts', function() {

	return gulp.src('src/scripts/*.js') /* [1] */
		.pipe(concat('main.js')) /* [2] */
		.pipe(gulp.dest('dev/js')) /* [3] */
		.pipe(rename({ suffix : '.min' })) /* [4] */
		.pipe(uglify()) /* [5] */
		.pipe(gulp.dest('dist/js')); /* [6] */

});

/**
 *    Styles build task. Compiles CSS from Sass, auto-prefixes
 *    and outputs both a minified and non-minified version into
 *    dist/ and dev/ respectively.
 *
 * 1. Using the main SCSS file.
 * 2. Compile using SASS, expanded style.
 * 3. Auto-prefix (e.g. -moz-) using last 2 browser versions.
 * 4. Output prefixed but non-minifed CSS to dev/css
 * 5. Rename to .min.css
 * 6. Minify the CSS.
 * 7. Output prefixed, minified CSS to dist/css.
 */
gulp.task('styles', function() {

	return gulp.src('src/styles/main.scss') /* [1] */
		.pipe(sass({ style : 'expanded' })) /* [2] */
		.pipe(autoprefixer('last 2 versions')) /* [3] */
		.pipe(gulp.dest('dev/css')) /* [4] */
		.pipe(rename({ suffix : '.min' })) /* [5] */
		.pipe(minifycss()) /* [6] */
		.pipe(gulp.dest('dist/css')); /* [7] */

});

/**
 *    Template rendering tasks. Compiles Swig template into HTML
 *    in /dev and /dist
 */
gulp.task('templates', function() {
	return gulp.src('src/*.html')
		.pipe(swig())
		.pipe(gulp.dest('dev/'))
		.pipe(gulp.dest('dist/'));
});

/**
 *    Image optimisation task.
 *
 * 1. Use any files in any subdirectory of src/images.
 * 2. Optimise, using cache to prevent re-optimising images
 *    that have not changed.
 * 3. Output optimised to dev/images.
 * 4. Output optimised to build/images.
 */
gulp.task('images', function() {

	return gulp.src('src/images/**/*') /* [1] */
		.pipe(cache(imagemin({ /* [2] */
			optimizationLevel : 3,
			progressive : true,
			interlaced : true
		})))
		.pipe(gulp.dest('dev/images')) /* [3] */
		.pipe(gulp.dest('dist/images')); /* [4] */

});

/**
 * Copy task. Copies over any files that are not part of other tasks
 * (e.g. HTML pages) to both /dev and /dist
 */
gulp.task('copy', function() {
	/* populate this task with any extra files you need to copy */
	/*return gulp.src('src/*.html')
		.pipe(gulp.dest('dev'))
		.pipe(gulp.dest('dist'));*/
});

/**
 *    Watch task. Sets up several watchers:
 *
 * 1. Any changes to any .scss files starts styles task.
 * 2. Any changes to any .js files starts scripts task.
 * 3. Any changes to any files in images/ starts images task.
 * 4. Any changes to files that just need copying starts copy task.
 */
gulp.task('watch', function() {

	gulp.watch('src/styles/**/*.scss', ['styles']);	/* [1] */

	gulp.watch('src/scripts/**/*.js', ['scripts']); /* [2] */

	gulp.watch('src/images/**/*', ['images']); /* [3] */

	gulp.watch('src/*.html', ['copy']); /* [4] */

});

/**
 *    Serve task. Starts a server to serve /dist statically.
 *
 * 1. Listen on the port defined by the constant above.
 * 2. Open the new server URL in the default browser.
 */
gulp.task('serve', function() {

	var server = express();
	server.use(express.static(__dirname + '/dist'));
	server.listen(DIST_SERVER_PORT); /* [1] */

	open('http://localhost:' + DIST_SERVER_PORT); /* [2] */

});

/**
 *    Develop task. Sets up watches and serves up /dev using
 *    livereload.
 *
 * 1. Initial run of build.
 * 2. LiveReload server listens on the port specified above.
 * 3. Inform the LiveReload server of any change in /dev
 * 4. Injects the LiveReload JS automatically.
 * 5. Dev web server listens on the port specified above.
 * 6. Automatically open the new server URL in the default browser.
 */
gulp.task('develop', function() {
	gulp.start('build'); /* [1] */

	gulp.start('watch');

	var lr = livereload(LIVERELOAD_PORT);

	gulp.watch('dev/**').on('change', function(file) { /* [3] */
		lr.changed(file.path);
	});

	//start web server
	var server = express();
	server.use(require('connect-livereload')({ port : LIVERELOAD_PORT })); /* [4] */
	server.use(express.static(__dirname + '/dev'));
	server.listen(DEV_SERVER_PORT); /* [5] */

	open('http://localhost:' + DEV_SERVER_PORT); /* [6] */

});

/**
 *    Build task. Runs other tasks that produce a built project
 *    in /dev and /dist.
 */
gulp.task('build', ['images', 'templates', 'styles', 'scripts', 'copy']);

/**
 * Default task. Lists out available tasks.
 */
gulp.task('default', function() {

	var cyan = gutil.colors.cyan,
		magenta = gutil.colors.magenta;

	gutil.log(magenta('----------'));
	gutil.log(magenta('Plump Gulp'));

	gutil.log('The following tasks are available:');

	gutil.log(cyan('build') + ': builds the contents of src/ to both dev/ and dist/');
	gutil.log(cyan('develop') + ': performs an initial build, sets up watches and serves up a LiveReload enabled web server');
	gutil.log(cyan('serve') + ': serves the contents of /dist on a static web server');

	gutil.log(magenta('----------'));

});