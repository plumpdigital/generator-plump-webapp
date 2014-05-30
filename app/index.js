'use strict';

var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

//Bower inuit package options (prepended with inuit-)
var inuitModules = [
	'defaults',
	'functions',
	'mixins',
	'normalize',
	'reset',
	'box-sizing',
	'shared',
	'clearfix',
	'page',
	'headings',
	'paragraphs',
	'lists',
	'images',
	'tables',
	'layout',
	'media',
	'flag',
	'box',
	'tabs',
	'buttons',
	'bare-list',
	'block-list',
	'ui-list',
	'spacing',
	'widths'
];

//Bower plump module options.
var plumpModules = [

];

/**
 *    Yeoman generator class. Each method (not starting with _) is
 *    executed in source order.
 */
var PlumpGenerator = yeoman.generators.Base.extend({

	init: function () {
		this.pkg = require('../package.json');

		this.on('end', function () {
			this.log(chalk.magenta('I\'m all done. You now need to run npm install / bower install.'));
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
		this.log(chalk.magenta('You\'re using the Plump web generator.'));

		var prompts = [{
			type: 'checkbox',
			name: 'inuitModules',
			message: 'Which inuit modules do you require?',
			choices : this._getModuleChoices(inuitModules)
		}];

		this.prompt(prompts, function (props) {
			this.inuitModules = props.inuitModules;
			done();
		}.bind(this));
  },

	/**
	 *    Create the app files.
	 *
	 * 1. Primary source directory is /src
	 * 2. Create NPM and Bower config. Using template rather than
	 *    copy runs the template through the Lo-Dash parser.
	 */
	app: function () {
		this.mkdir('src'); /* [1] */

		/* [2] */
		this.template('_package.json', 'package.json');
		this.template('_bower.json', 'bower.json');

		/* [3] */
		this.mkdir('src/templates/partials');
		this.mkdir('src/templates/layout');
		this.mkdir('src/images');
		this.mkdir('src/styles');
		this.mkdir('src/scripts');
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
		this.copy('gitignore', '.gitignore'); /* [3] */

		this.copy('gulpfile.js', 'gulpfile.js');
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
