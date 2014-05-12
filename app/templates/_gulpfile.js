
var gulp = require('gulp');

//plugin requires

var concat       = require('gulp-concat'),
	uglify       = require('gulp-uglify'),
	jshint       = require('gulp-jshint'),
	rename       = require('gulp-rename'),
	sass         = require('gulp-ruby-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	minifycss    = require('gulp-minify-css'),
	imagemin     = require('gulp-imagemin'),
	cache        = require('gulp-cache'),
	clean        = require('gulp-clean'),
	livereload   = require('gulp-livereload');

/**
 *    Script build task. Combines and uglifies JS, producing
 *    both a minified and non-minified version in dest/ and
 *    dev/ respectively.
 * 
 * 1. Using all .js files in /src/js
 * 2. Combine into main.js
 * 3. Output development version to dev/js
 * 4. Rename to main.min.js
 * 5. Uglify to minify.
 * 6. Output minified version to dist/js
 */
gulp.task('scripts', function() {

	return gulp.src('src/js/*.js')			/* [1] */
		.pipe(concat('main.js'))			/* [2] */
		.pipe(gulp.dest('dev/js'))			/* [3] */
		.pipe(rename({ suffix : '.min' }))	/* [4] */
		.pipe(uglify())						/* [5] */
		.pipe(gulp.dest('dest/js'));		/* [6] */

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

	return gulp.src('src/styles/main.scss')		/* [1] */
		.pipe(sass({ style : 'expanded' }))		/* [2] */
		.pipe(autoprefixer('last 2 versions'))	/* [3] */
		.pipe(gulp.dest('dev/css'))				/* [4] */
		.pipe(rename({ suffix : '.min' }))		/* [5] */
		.pipe(minifycss())						/* [6] */
		.pipe(gulp.dest('dist/css'));			/* [7] */

});

/**
 *    Image optimsation tast.
 *
 * 1. Use any files in any subdirectory of src/images.
 * 2. Optimise, using cache to prevent re-optimising images
 *    that have not changed.
 * 3. Output optimised to dev/images.
 * 4. Output optimised to build/images.
 */
gulp.task('images', function() {

	return gulp.src('src/images/**/*')		/* [1] */
		.pipe(cache(imagemin({				/* [2] */
			optimizationLevel : 3,
			progressive : true,
			interlaced : true
		})))
		.pipe(gulp.dest('dev/images'))		/* [3] */
		.pipe(gulp.dest('build/images'));	/* [4] */

});

/**
 *    Watch task. Sets up several watchers:
 *
 * 1. Any changes to any .scss files starts styles task.
 * 2. Any changes to any .js files starts scripts task.
 * 3. Any changes to any files in images/ starts images task.
 */
gulp.task('watch', function() {

	gulp.watch('src/styles/**/*.scss', ['styles']);	/* [1] */

	gulp.watch('src/js/**/*.js', ['scripts']);		/* [2] */

	gulp.watch('src/images/**/*', ['images']);		/* [3] */

});