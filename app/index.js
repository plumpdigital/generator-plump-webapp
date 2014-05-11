'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

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

var plumpModules = [

];

var PlumpGenerator = yeoman.generators.Base.extend({

  init: function () {
    this.pkg = require('../package.json');

    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.installDependencies();
      }
    });
  },

  askFor: function () {
    var done = this.async();

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

  app: function () {
    this.mkdir('app');
    this.mkdir('app/templates');

    this.copy('_package.json', 'package.json');
    this.copy('_bower.json', 'bower.json');
  },

  projectfiles: function () {
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
  },

  _getModuleChoices: function(modules) {
    //create a choices array for use with checkbox prompt
    var choices = [];
    for (var i = 0; i < modules.length; i++) {
      choices[i] = { name : modules[i] };
    }
    return choices;
  }

});

module.exports = PlumpGenerator;
