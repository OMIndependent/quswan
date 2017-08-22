#!/usr/bin/env node

var pkg           = require("./package.json");

var Metalsmith    = require('metalsmith');
var assets        = require('metalsmith-assets');
var markdown      = require('metalsmith-markdown');
var layouts       = require('metalsmith-layouts');
var collections   = require('metalsmith-collections');
var publish       = require('metalsmith-publish');
var permalinks    = require('metalsmith-permalinks');
var wordcount     = require('metalsmith-word-count');
var mapsite       = require('metalsmith-mapsite');
var browsersync   = require('metalsmith-browser-sync');
var pug           = require('metalsmith-pug');

// Custom plugins
//var setdate       = require('metalsmith-date');

var meta = {
  title: "Ocampo's Moon",
  sitetitle: "Ocampo's Moon",
  siteurl: "http://quswan.net/",
  domain:  "http://quswan.net/",
  description: "My personal blog site made by Metalsmith",
  generator: "Metalsmith",
  version:  pkg.version
}; // Metadata here

var dir = {
  base:   __dirname,
  source:    "./src/",
  dest:  "./bin/"
}; // Directory paths here

var opts = {
  pretty: false
}; // For pug plugin options

var configTemplate = {
  engine: 'pug',
  directory: "_layouts/",
  partials: "_includes/",
  default: 'home.pug'
}; // Config template

var clean = true; // Clean build or not?
var word = false; // Output word count

Metalsmith(dir.base)
  .clean(clean)  // Clean the build
  .metadata(meta) // Get metadata
  .source(dir.source) // Place source files into '/src/' directory
  .destination(dir.dest) // Place final web files into '/bin/' directory
  .use(pug(opts)) // Add pug-to-HTML plugin
  .use(markdown()) // Add markdown-to-HTML plugin
  .use(permalinks()) // Add permalinks to site
  .use(debug(true)) // Debug and print any errors in console
  .use(publish())
  .use(collections({
    posts: {
      pattern: 'posts/*.md',
      sortBy: 'date',
      layout: '_layouts/post.pug'
    },
    transcripts: {
      pattern: 'transcripts/**/*.md',
      layout: '_layouts/page.pug'
    },
    liveblogs: {
      pattern: 'liveblogs/**/*',
      sortBy: 'date',
      reverse: true,
      layout: '_layouts/post.pug'
    },
    trivia: {
      pattern: 'trivia/**/**/*',
      layout: '_layouts/page.pug'
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
    files:  ['./src/' + '**/*']
  }), function(err) {
    if (err) { throw err; }
  })
  .build(function(err) {
    if (err) { throw err; }
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
