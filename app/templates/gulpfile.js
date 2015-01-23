//    Gulp utility.
var gulp    = require('gulp'),
	gutil   = require('gulp-util'),
	plumber = require('gulp-plumber');

//    Requires.
var express     = require('express'),
	open        = require('open'),
	rimraf      = require('rimraf'),
	merge       = require('merge-stream'),
	runsequence = require('run-sequence'),
	stylish     = require('jshint-stylish');

//    Plugin requires.
var concat       = require('gulp-concat'),
	uglify       = require('gulp-uglify'),
	jshint       = require('gulp-jshint'),
	rename       = require('gulp-rename'),
	swig         = require('gulp-swig'),
	sass         = require('gulp-ruby-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	minifycss    = require('gulp-minify-css'),
	globcss      = require('gulp-css-globbing'),
	imagemin     = require('gulp-imagemin'),
	newer        = require('gulp-newer'),
	livereload   = require('gulp-livereload'),
	ftp          = require('gulp-ftp');

/**
 *    Require external gulp configuration.
 */
var config = require('./gulp-config.json');

/**
 *    Require command-line arguments.
 */
var argv = require('yargs').argv;

/**
 *    Handle pipeline errors to prevent breaking the gulp stream.
 */
var onError = function (err) {
	console.log(err);
};

/**
 *    Constants.
 */
var DIST_SERVER_PORT 	= 9001;
var DEV_SERVER_PORT 	= 9000;
var LIVERELOAD_PORT 	= 35729;

/**
 *    Script build task. Combines and uglifies JS, producing
 *    both a minified and non-minified version in dist/ and
 *    dev/ respectively.
 *
 * 1. Using all files defined in files.scripts config.
 * 2. Run JSHint and report the output.
 * 3. Combine into main.js
 * 4. Output development version to dev/js
 * 5. Rename to main.min.js
 * 6. Uglify to minify.
 * 7. Output minified version to dist/js
 */
gulp.task('scripts', function() {

	return gulp.src(config.files.scripts) /* [1] */
		.pipe(jshint()) /* [2] */
		.pipe(jshint.reporter(stylish))
		.pipe(concat('main.js')) /* [3] */
		.pipe(gulp.dest('dev/js')) /* [4] */
		.pipe(rename({ suffix : '.min' })) /* [5] */
		.pipe(uglify()) /* [6] */
		.pipe(gulp.dest('dist/js')); /* [7] */
});

/**
 *    Styles build task. Compiles CSS from SASS, auto-prefixes
 *    and outputs both a minified and non-minified version into
 *    dist/ and dev/ respectively.
 *
 * 1. Using all files defined in files.styles config.
 * 2. Catch any errors within the SASS build pipeline.
 * 3. Globally collect any SCSS partials and build them.
 * 4. Compile using SASS, expanded style.
 * 5. Auto-prefix (e.g. -moz-) using last 2 browser versions.
 * 6. Output prefixed but non-minifed CSS to dev/css
 * 7. Rename to .min.css
 * 8. Minify the CSS.
 * 9. Output prefixed, minified CSS to dist/css.
 */

gulp.task('styles', function() {

	return gulp.src(config.files.styles) /* [1] */
		.pipe(plumber(onError)) /* [2] */
		.pipe(globcss({ extensions: ['.scss'] })) /* [3] */
		.pipe(sass({ style : 'expanded' })) /* [4] */
		.pipe(autoprefixer('last 2 versions')) /* [5] */
		.pipe(gulp.dest('dev/css')) /* [6] */
		.pipe(rename({ suffix : '.min' })) /* [7] */
		.pipe(minifycss()) /* [8] */
		.pipe(gulp.dest('dist/css')); /* [9] */
});

/**
 *    Template rendering tasks. Compiles Swig template into HTML
 *    in /dev and /dist
 *
 * 1. Disable Swig caching. Without this, any task that continues to
 *    run (e.g. watch / serve) will re-use the memory-cached compiled
 *    template and not reflect any changes.
 * 2. Set 'dist' so that it can be checked within the template.
 * 3. Return the merged stream. This allows us to have two disparate stream
 *    tasks for dev/dist doing slightly different things.
 */
gulp.task('templates', function() {

	var dev = gulp.src(config.files.templates)
		.pipe(swig({
			defaults : { cache : false } /* [1] */
		}))
		.pipe(gulp.dest('dev/'));

	var dist = gulp.src(config.files.templates)
		.pipe(swig({
			defaults : { cache : false }, /* [1] */
			data : {
				dist : true /* [2] */
			}
		}))
		.pipe(gulp.dest('dist/'));

	return merge(dev, dist); /* [3] */
});

/**
 *    Image optimsation task.
 *
 * 1. Determine whether to use imagemin or do nothing (noop).
 * 2. Use files defined in files.images config.
 * 3. Filter to only images that are newer than in dev/images
 * 4. Output optimised to dev/images
 * 5. Output optimised to build/images
 */
gulp.task('images', function() {

	var imageminPipe = config.minifyImages ? imagemin({
		optimizationLevel : 3,
		progressive : true,
		interlaced : true
	}) : gutil.noop(); /* [1] */

	return gulp.src(config.files.images) /* [2] */
		.pipe(newer('dev/images')) /* [3] */
		.pipe(imageminPipe)
		.pipe(gulp.dest('dev/images')) /* [4] */
		.pipe(gulp.dest('dist/images')); /* [5] */

});

/**
 *    Font copy task.
 *
 * 1. Using all files defined in files.fonts config.
 * 2. Output font files to dev/fonts.
 * 3. Output font files to dist/fonts.
 */

gulp.task('fonts', function() {

	return gulp.src(config.files.fonts) /* [1] */
		.pipe(gulp.dest('dev/fonts')) /* [2] */
		.pipe(gulp.dest('dist/fonts')); /* [3] */
});


/**
 *    Copy task. Copies over any files that are not part of other tasks
 *    (e.g. HTML pages) to both /dev and /dist
 *    Clean task. Deletes the dev/ and dist/ directories.
 */
gulp.task('clean', function(callback) {

	return rimraf('./dev', function() {
		rimraf('./dist', callback)
	});
});

/**
 *    Copy task. Copies over any files that are not part of other tasks
 *    (e.g. HTML pages, JS libraries) to both /dev and /dist
 *
 * 1. Change the base path to avoid copying top-level directories.
 */
gulp.task('copy', function() {

	return gulp.src(config.files.copy, { base : config.copyBase }) /* [1] */
		.pipe(gulp.dest('dev'))
		.pipe(gulp.dest('dist'));
});

/**
 *    Watch task. Sets up several watchers. Using different config for styles and
 *    templates as they have partials that need watching but not compiling.
 *
 * 1. Any changes to any files from files.watchStyles config starts styles task.
 * 2. Any changes to any files from files.scripts config starts scripts task.
 * 3. Any changes to any files from files.images config starts images task.
 * 4. Any changes to any files from files.watchTemplates starts templates task.
 */
gulp.task('watch', function() {

	gulp.watch(config.files.watchStyles, ['styles']);	/* [1] */
	gulp.watch(config.files.scripts, ['scripts']); /* [2] */
	gulp.watch(config.files.images, ['images']); /* [3] */
	gulp.watch(config.files.watchTemplates, ['templates']); /* [4] */
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
 *    Stage task. Builds then uploads the contents of dist/ to an FTP site
 *    using values from stage config.
 */
gulp.task('stage', ['build'], function() {

	return gulp.src('dist/**/*')
	.pipe(ftp({
		host : config.stage.host,
		user : config.stage.user,
		pass : config.stage.password,
		remotePath : config.stage.remotePath
	}));
});

/**
 *    Develop task. Sets up watches and serves up /dev using
 *    livereload.
 *
 * 1. Initial run of build and watch.
 * 2. LiveReload server listens on the port specified above.
 * 3. Inform the LiveReload server of any change in /dev
 * 4. Injects the LiveReload JS automatically.
 * 5. Dev web server listens on the port specified above.
 * 6. Automatically open the new server URL in the default browser.
 */
gulp.task('develop', ['build', 'watch'] /* [1] */, function() {

	var lr = livereload(LIVERELOAD_PORT);

	gulp.watch('dev/**/*').on('change', function(file) { /* [3] */
		lr.changed(file.path);
	});

	var server = express();

	server.use(require('connect-livereload')({ port : LIVERELOAD_PORT })); /* [4] */
	server.use(express.static(__dirname + '/dev'));
	server.listen(DEV_SERVER_PORT); /* [5] */

	if (argv.open !== false) {
		open('http://localhost:' + DEV_SERVER_PORT); /* [6] */
	}

});

/**
 *    Build task. Runs other tasks that produce a built project
 *    in /dev and /dist.
 *
 * 1. Using runsequence to run clean first, separate to the build tasks. Passing
 *    the Gulp callback to runsequence so that the task can complete correctly.
 */
gulp.task('build', function(callback) {
	runsequence('clean', ['images', 'fonts', 'templates', 'styles', 'scripts', 'copy'], callback);
});

/**
 *    Default task. Lists out available tasks.
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
