#!/usr/bin/env node

'use strict'; // Do not use any unneeded vars when running

const pkg           = require('./package.json');

const Metalsmith    = require('metalsmith');
const publish       = require('metalsmith-publish');
const drafts        = require('metalsmith-drafts');
const collections   = require('metalsmith-collections');
const assets        = require('metalsmith-assets');
const pug           = require('metalsmith-pug');
const markdown      = require('metalsmith-markdown');
const layouts       = require('metalsmith-layouts');
const permalinks    = require('metalsmith-permalinks');
const pagination    = require('metalsmith-pagination');
const wordcount     = require('metalsmith-word-count');
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

var collexions = {
  home: {
    metadata: {
      layout: 'home.pug'
    }
  },
  posts: {
    pattern: 'posts/*.md',
    sortBy: 'publishDate',
    reverse: true,
    refer: true,
    metadata: {
      layout: 'entry.pug'
    }
  },
  pages: {
    pattern: '**/*.md',
    metadata: {
      layout: 'page.pug'
    }
  },
  transcripts: {
    pattern: ['transcripts/**/*.md', '!transcripts/**/index.*'],
    metadata: {
      layout: 'page.pug'
    }
  },
  liveblogs: {
    pattern: ['liveblogs/**/*.md', '!liveblogs/**/index.*'],
    sortBy: 'publishDate',
    reverse: true,
    refer: true,
    metadata: {
      layout: 'entry.pug'
    }
  },
  trivia: {
    pattern: 'trivia/**/*',
    refer: true,
    metadata: {
      layout: 'page.pug'
    }
  }
}; // For collections plugin metadata

var opts = {
  pretty: false,
  useMetadata: true
}; // For pug plugin options

var perm = {
  // pattern: ':title',
  relative: false
  /*linksets: [{
    match: { collection: 'liveblogs',
          categories: 'alundra' },
    pattern: 'liveblogs/alundra/:filename',
    date: 'MMMDoYYYY'
  },{
    match: { collection: 'liveblogs',
          categories: 'dust' },
    pattern: 'liveblogs/dust/:filename'
  },{
    match: { collection: 'liveblogs',
          categories: 'smrpg' },
    pattern: 'liveblogs/smrpg/:filename'
  },{
    match: { collection: 'liveblogs', categories: 'voltron' },
    pattern: 'liveblogs/vld/:filename'
  },{
    match: { collection: 'posts' },
    pattern: ':date/:filename'
  }]*/
}; // Permalink pattern here

var pagi = {
  /*'collections.posts': {
    perPage: 12,
    layout: 'home.pug',
    path: ':date/:title',
  },
  'collections.liveblogs': {
    perPage: 3,
    layout: 'home.pug',
    first: 'index.html',
    noPageOne: true,
    filter: function (entry) {
      return !entry.private
    }
  }*/
}; // Pagination settings here

var publishOpts = {
  draft: true,
  private: true,
  unlisted: true
}; // Publish post settings here

var configTemplate = {
  engine: 'pug',
  directory: 'layouts',
  default: 'layout.pug'
}; // Config template

var assetsOpts = {
  source: './assets',
  destination: './assets'
}; // Settings for images, css files

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
  .use(publish(publishOpts)) // Add plugin for drafts, queued, and private posts
  .use(drafts()) // Enable drafts for posts
  .use(collections(collexions)) // Sort posts into collections
  .use(pug(opts)) // Add pug-to-HTML plugin
  .use(markdown()) // Add markdown-to-HTML plugin
  .use(pagination(pagi)) // Add pagination features
  .use(permalinks(perm)) // Add permalinks to site
  .use(wordcount({
    raw: word
  }))
  .use(layouts(configTemplate)) // Add layout to site
  .use(assets(assetsOpts)) // Add assets to site
  //.use(htmlmin('*.html',minify))
  .use(cssmin(cssminify))
  .use(debug(log)) // Debug and print any errors in console
  .use(browsersync({
    server: './bin/',
    files:  ['./src/**/**/*', './src/**/*', './src/*',
      'assets/*'],
    port: 8080,
    injectChanges: false
  }), function(err) {
    if (err) { throw err; }
  })
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
      console.log(Metalsmith.metadata().collections);
    }
    done();
  };
};
