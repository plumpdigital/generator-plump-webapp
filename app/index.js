'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

var inuitModules = {
  generic : [
    'clearfix',
    'normalize',
    'reset',
    'box-sizing',
    'shared'
  ],
  base : {
    'page',
    'headings',
    'paragraphs',
    'lists',
    'images'
  },
  objects : [
    'tables',
    'buttons',
    'tabs',
    'media',
    'flag',
    'block-list',
    'box',
    'ui-list',
    'bare-list',
    'layout'
  ],
  trumps : [
    'spacing',
    'widths'
  ]
};

var plumpModules = {

};

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
    this.log(chalk.magenta('You\'re using the fantastic Plump generator.'));

    var prompts = [{
      type: 'confirm',
      name: 'someOption',
      message: 'Would you like to enable this option?',
      default: true
    }];

    this.prompt(prompts, function (props) {
      this.someOption = props.someOption;

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
  }

});

module.exports = PlumpGenerator;
