#!/usr/bin/env node

const pkg           = require("./package.json");

const Metalsmith    = require('metalsmith');
const assets        = require('metalsmith-assets');
const markdown      = require('metalsmith-markdown');
const layouts       = require('metalsmith-layouts');
const collections   = require('metalsmith-collections');
const drafts        = require('metalsmith-drafts');
const publish       = require('metalsmith-publish');
const permalinks    = require('metalsmith-permalinks');
const wordcount     = require('metalsmith-word-count');
const mapsite       = require('metalsmith-mapsite');
const browsersync   = require('metalsmith-browser-sync');
const pug           = require('metalsmith-pug');

// Custom plugins
//var setdate       = require('metalsmith-date');

const meta = {
  title: "Ocampo's Moon",
  sitetitle: "Ocampo's Moon",
  siteurl: "http://quswan.net/",
  domain:  "http://quswan.net/",
  description: "My personal blog site made by Metalsmith",
  generator: "Metalsmith",
  version:  pkg.version
}; // Metadata here

const dir = {
  base:   __dirname,
  source:    "./src/",
  dest:  "./bin/"
}; // Directory paths here

const opts = {
  pretty: false
}; // For pug plugin options

const perm = {
  pattern: ':collection/:title'
}; // Permalink pattern here

const configTemplate = {
  engine: 'pug',
  directory: "_layouts/",
  partials: "_includes/",
  default: 'home.pug'
}; // Config template

var clean = true; // Clean build or not?
var word = false; // Output word count

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
      pattern: 'liveblogs/**/*.md',
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
    files:  ['./src/' + '**/*'],
    port: 8080
  }), function(err) {
    if (err) { throw err; }
  })
  .build(function(err) {
    if (err) { throw err; }
    console.log("Build complete.\n")
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
