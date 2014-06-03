
# Plump [Yeoman](http://yeoman.io) webapp generator

## Getting Started

Install Yeoman globally, if you haven't already done so:

```
$ npm install -g yo
```

To install generator-plump from npm, run:

```
$ npm install -g generator-plump-webapp
```

Finally, initiate the generator:

```
$ yo plump-webapp
```

## What Gets Generated

This generator builds the starting point of a webapp (HTML/CSS/JS) using Swig for templating and partials and SASS for CSS pre-processing. It also generates a [Gulp](http://gulpjs.com/) file that handles compiling, minification, serving, live-reloading and image compression.

Compiled output is placed in `/dev` in an un-minified development state and `/dist` in a production-ready state.

Running `gulp develop` will perform an initial build, launch a live-reload-enabled web server, open `dev/index.html` in your primary browser and watch for changes to pretty much everything in `src/`. Any changes are automatically dealt with and passed to live-reload.

Running `gulp serve` launches a web server and opens `dist/index.html` for final checks on production-ready code.

## License

MIT
