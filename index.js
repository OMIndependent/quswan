#!/usr/bin/env node

'use strict'; // Do not use any unneeded vars when running

const pkg           = require('./package.json');

const Metalsmith    = require('metalsmith');
const assets        = require('metalsmith-assets');
const markdown      = require('metalsmith-markdown');
const pug           = require('metalsmith-pug');
const layouts       = require('metalsmith-layouts');
const collections   = require('metalsmith-collections');
const drafts        = require('metalsmith-drafts');
const publish       = require('metalsmith-publish');
const permalinks    = require('metalsmith-permalinks');
const wordcount     = require('metalsmith-word-count');
const mapsite       = require('metalsmith-mapsite');
const htmlmin       = require('metalsmith-html-minifier');
const cssmin        = require('metalsmith-clean-css');
const browsersync   = require('metalsmith-browser-sync');

// Custom plugins
//const setdate       = require('metalsmith-date');

var meta = {
  site: {
    title: "Quesada's Swan | ",
    url: "http://quswan.net/"
  },
  domain:  "http://quswan.net",
  description: "The Socially Aware Magic Swordsman's independent blog site powered by Metalsmith",
  generator: "Metalsmith",
  version:  pkg.version
}; // Metadata here

var dir = {
  base:   __dirname,
  source:    './src/',
  dest:  './bin/'
}; // Directory paths here

var opts = {
  pretty: false,
  useMetadata: true
}; // For pug plugin options

var perm = {
  pattern: ':collection/:title',
  relative: false,
  linksets: [{
    match: { collection: 'liveblogs' },
    pattern: 'liveblogs/:title'
  },{
    match: { collection: 'posts' },
    pattern: ':title'
  },{
    match: { collection: 'pages' },
    pattern: ':title'
  }]
}; // Permalink pattern here

var configTemplate = {
  engine: 'pug',
  directory: 'layouts',
  default: 'layout.pug'
}; // Config template

var clean = true; // Clean build or not?
var word = false; // Output word count

var minify = {
  collapseBooleanAttributes: false,
  collapseWhitespace: false
}; // Settings for html-minifier here

var cssminify = {
  files: ['assets/*.css', 'assets/**/*.css']
}; // Settings for css minifier here

var log = true; // Toggle debug log

Metalsmith(dir.base)
  .clean(clean)  // Clean the build
  .metadata(meta) // Get metadata
  .source(dir.source) // Place source files into '/src/' directory
  .destination(dir.dest) // Place final web files into '/bin/' directory
  .use(debug(log)) // Debug and print any errors in console
  .use(pug(opts)) // Add pug-to-HTML plugin
  .use(markdown()) // Add markdown-to-HTML plugin
  .use(permalinks(perm)) // Add permalinks to site
  .use(drafts()) // Add enabling of drafted posts
  .use(publish())
  .use(collections({
    home: {
      metadata: {
        layout: 'home.pug'
      }
    },
    posts: {
      pattern: '/*',
      sortBy: 'date',
      reverse: true,
      refer: true,
      metadata: {
        layout: 'post.pug'
      }
    },
    pages: {
      pattern: '/*',
      metadata: {
        layout: 'page.pug'
      }
    },
    transcripts: {
      pattern: 'transcripts/**/*.',
      metadata: {
        layout: 'page.pug'
      }
    },
    liveblogs: {
      pattern: 'liveblogs/**/*.md',
      sortBy: 'date',
      reverse: true,
      refer: true,
      metadata: {
        layout: 'entry.pug'
      }
    },
    trivia: {
      pattern: 'trivia/**/*.md',
      refer: true,
      metadata: {
        layout: 'post.pug'
      }
    }
  }))
  .use(wordcount({
    raw: word
  }))
  .use(layouts(configTemplate)) // Add layout to site
  .use(assets({
    source: './assets/',
    destination: './assets/'
  })) // Add assets to site
  .use(browsersync({
    server: './bin/',
    files:  ['./src/**/**/*', './src/**/*', './src/*',
      'assets/*'],
    port: 8080
  }), function(err) {
    if (err) { throw err; }
  })
  .use(htmlmin('*.html',minify))
  .use(cssmin(cssminify))
  .build(function(err) {
    if (err) { throw err; }
    else { console.log("Build complete.\n") }
  }); // Call exceptions when things go wrong

// Debug function to check if website loads correctly
function debug(log) {
  return function(files, Metalsmith, done) {
    if (log) {
      console.log("\nMETADATA:");
      console.log(Metalsmith.metadata());

      for (var f in files) {
        console.log("\nFILE:");
        console.log(files[f]);
      }

      console.log("\nCOLLECTIONS:");
      var collections = Metalsmith.metadata().collections;
      for (var c in collections) {
        console.log(collections[c]);
      }
    }
    done();
  };
};
