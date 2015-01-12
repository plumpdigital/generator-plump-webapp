'use strict';

var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

/**
 *    Bower inuit package options (prepended with inuitcss-).
 *    Organise alphabetically within Shearing layer category.
 */
var inuitModules = [

	// Settings
	'defaults',
	'responsive-settings',

	// Tools
	'functions',
	'mixins',
	'responsive-tools',

	// Generic
	'box-sizing',
	'normalize',
	'reset',
	'shared',

	// Base
	'headings',
	'images',
	'lists',
	'page',
	'paragraphs',

	// Object
	'box',
	'buttons',
	'flag',
	'layout',
	'list-bare',
	'list-block',
	'list-inline',
	'list-ui',
	'media',
	'pack',
	'tables',
	'tabs',

	// Trumps
	'clearfix',
	'print',
	'spacing',
	'spacing-responsive',
	'widths',
	'widths-responsive'
];

/**
 *    Bower plump package options (prepended with plumpcss-).
 *    Organise alphabetically within shearing layer category.
 */
var plumpModules = [

	// Settings
	'defaults',

	// Tools
	'functions',
	'mixins',

	// Objects
	'band',
	'band-responsive',
	'exhibit',
	'meter',
	'nav-list',
	'stack',
	'wrapper',

	// Trumps
	'floats',
	'hide',
	'text-align'
];

/**
 *    Yeoman generator class. Each method (not starting with _) is
 *    executed in source order.
 */
var PlumpGenerator = yeoman.generators.Base.extend({

	init: function () {
		this.pkg = require('../package.json');

		this.on('end', function () {
			this.log(chalk.magenta.bold('I\'m all done. You now need to run ') +
					 chalk.green.bold('npm install ') +
					 chalk.magenta.bold('& ') +
					 chalk.green.bold('bower install'));
		});
	},

	/**
	 *    Prompts for project configuration.
	 *
	 * 1. Create asynchronous callback to pause execution
	 *    until all the prompts are completed.
	 */
	askFor: function () {
		var done = this.async(); /* [1] */

		// have Yeoman greet the user
		this.log(this.yeoman);

		// replace it with a short and sweet description of your generator
		this.log(chalk.magenta('You\'re using the Plump web generator v' + this.pkg.version));

		var prompts = [{
			type : 'checkbox',
			name : 'inuitModules',
			message : 'Which inuit modules do you require?',
			choices : this._getModuleChoices(inuitModules)
		},{
			type : 'checkbox',
			name : 'plumpModules',
			message : 'Which plumpcss modules do you require?',
			choices : this._getModuleChoices(plumpModules)
		}];

		this.prompt(prompts, function (props) {
			this.inuitModules = props.inuitModules;
			this.plumpModules = props.plumpModules;
			done();
		}.bind(this));
	},

	/**
	 *    Create the app files.
	 *
	 * 1. Primary source directory is /src
	 * 2. Create NPM and Bower config. Using template rather than
	 *    copy runs the template through the Lo-Dash parser.
	 * 3. Create base directories.
	 * 4. Create base SASS stylesheets.
	 * 5. Create base HTML page and Swig templates.
	 */
	app: function () {
		this.mkdir('src'); /* [1] */

		/* [2] */
		this.template('_package.json', 'package.json');
		this.template('_bower.json', 'bower.json');

		/* [3] */
		this.mkdir('src/images');
		this.mkdir('src/styles');
		this.mkdir('src/scripts');

		/* [4] */
		this.template('src/styles/_style.scss', 'src/styles/style.scss');
		this.template('src/styles/_settings.colors.scss', 'src/styles/_settings.colors.scss');

		/* [5] */
		this.directory('src/templates', 'src/templates');
		this.copy('src/index.html', 'src/index.html');
	},

	/**
	 *    Create additional app configuration files.
	 *
	 * 1. Editor config (http://editorconfig.org/)
	 * 2. JSHint config (http://www.jshint.com/docs/)
	 * 3. Basic .gitignore to ignore NPM and Bower components.
	 */
	 projectfiles: function () {
		this.copy('editorconfig', '.editorconfig'); /* [1] */
		this.copy('jshintrc', '.jshintrc'); /* [2] */
		this.copy('jshintignore', '.jshintignore'); /* [2] */
		this.copy('gitignore', '.gitignore'); /* [3] */

		this.copy('gulpfile.js', 'gulpfile.js');
		this.copy('gulp-config.json', 'gulp-config.json');
	},

	/**
	 *    Helper to create a choices array for checkbox prompts.
	 */
	_getModuleChoices: function(modules) {
		var choices = [];
		for (var i = 0; i < modules.length; i++) {
			choices[i] = { name : modules[i] };
		}
		return choices;
	}

});

module.exports = PlumpGenerator;
