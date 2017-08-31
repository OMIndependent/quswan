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
const browsersync   = require('metalsmith-browser-sync');

// Custom plugins
//const setdate       = require('metalsmith-date');

const meta = {
  site: {
    title: "Ocampo's Moon |",
    url: "http://quswan.net/"
  },
  domain:  "http://quswan.net",
  description: "The Socially Aware Magic Swordsman's independent blog site made by Metalsmith",
  generator: "Metalsmith",
  version:  pkg.version
}; // Metadata here

const dir = {
  base:   __dirname,
  source:    './src/',
  dest:  './bin/'
}; // Directory paths here

const opts = {
  pretty: false,
  useMetadata: true
}; // For pug plugin options

const perm = {
  pattern: ':collection/:title'
}; // Permalink pattern here

const configTemplate = {
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

var log = false; // Toggle debug log

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
      pattern: '',
      metadata: {
        name: '',
        layout: 'home.pug'
      }
    },
    /*posts: {
      pattern: 'posts/*',
      sortBy: 'date',
      reverse: true,
      refer: true,
      metadata: {
        layout: 'post.pug'
      }
    },*/
    transcripts: {
      pattern: 'transcripts/**/*',
      metadata: {
        name: 'Transcripts',
        layout: 'page.pug'
      }
    },
    liveblogs: {
      pattern: 'liveblogs/**/**/*.md',
      sortBy: 'date',
      reverse: true,
      refer: true,
      metadata: {
        name: 'Liveblogs',
        layout: 'entry.pug'
      }
    },
    trivia: {
      pattern: 'trivia/**/**/*',
      refer: true,
      metadata: {
        name: 'Trivia',
        layout: 'post.pug'
      }
    }
  }))
  .use(layouts(configTemplate)) // Add layout to site
  .use(wordcount({
    raw: word
  }))
  .use(assets({
    source: './assets/',
    destination: './assets/'
  })) // Add assets to site
  .use(browsersync({
    server: './bin/',
    files:  ['./src/**/*', './src/*', 'assets/*', '_layouts/*.pug'],
    port: 8080
  }), function(err) {
    if (err) { throw err; }
  })
  .use(htmlmin('*.html',minify))
  .build(function(err) {
    if (err) { throw err; }
    else { console.log("Build complete.\n") }
  }); // Call exceptions when things go wrong loading site

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
    }
    done();
  };
};
