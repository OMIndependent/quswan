#!/usr/bin/env node

// Do not use any unneeded vars when running
'use strict';

// Import plugins
const pkg           = require('./package.json');

const Metalsmith    = require('metalsmith');
const publish       = require('metalsmith-publish');
const drafts        = require('metalsmith-drafts');
const collections   = require('metalsmith-collections');
const assets        = require('metalsmith-assets');
const pug           = require('metalsmith-pug');
const markdown      = require('metalsmith-markdown');
const moment        = require('metalsmith-moment');
const layouts       = require('metalsmith-layouts');
const permalinks    = require('metalsmith-permalinks');
const pagination    = require('metalsmith-pagination');
const wordcount     = require('metalsmith-word-count');
const htmlmin       = require('metalsmith-html-minifier');
const cssmin        = require('metalsmith-clean-css');
const browsersync   = require('metalsmith-browser-sync');


/* Global metadata */
var meta = {
  site: {
    title: "Quesada's Swan | ",
    url: "http://quswan.net/"
  },
  domain:  "http://quswan.net",
  description: "The Socially Aware Magic Swordsman's independent blog site powered by Metalsmith",
  generator: "Metalsmith",
  version:  pkg.version
};

/* Directory paths */
var dir = {
  base:   __dirname,
  source:    './src/',
  dest:  './bin/'
};

/* Collections metadata list */
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
};

/* Pug plugin settings */
var opts = {
  pretty: false,
  useMetadata: true
};

/* Moment time format settings */
var mtime = ['date']; /* NOTE: 'date' is taken from markdown file's YAML front matter.
Input date formats accepted is:
  "YYYY-MM-DD HH:mm:ss Z+-HHmm" or "YYYY-MM-DD +-HHmm" ->
  "2020-07-01 15:03:25 -0700" or "2020-07-01 -0700"
The output date format will return:
  "MMMM Do, YYYY" -> "July 1st, 2020" */

/* Permalink settings */
var perm = {
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
};

/* Pagination settings */
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
};

/* Post publish settings */
var publishOpts = {
  draft: true,
  private: true,
  unlisted: true
};

/* Template/layout engine plugin settings */
var configTemplate = {
  engine: 'pug',
  directory: 'layouts',
  default: 'layout.pug'
};

/* Assets settings */
var assetsOpts = {
  source: './assets',
  destination: './assets'
};

// Clean build directory or not?
var clean = true;

// Output word count
var word = false;

/* HTML minifier settings */
var minify = {
  collapseBooleanAttributes: false,
  collapseWhitespace: false
};

/* CSS minifier settings */
var cssminify = {
  files: ['assets/*.css', 'assets/**/*.css']
};

// Toggle debug log
var log = true;

Metalsmith(dir.base)
  .clean(clean)  // Clean the build directory
  .metadata(meta) // Get metadata
  .source(dir.source) // Place source files into '/src/' directory
  .destination(dir.dest) // Place final web files into '/bin/' directory

  .use(publish(publishOpts)) // Add plugin for drafts, queued, and private posts

  .use(drafts()) // Enable drafts for posts

  .use(collections(collexions)) // Sort posts into collections

  .use(pug(opts)) // Add pug-to-HTML plugin

  .use(markdown()) // Add markdown-to-HTML plugin

  .use(moment(mtime)) // Add moment plugin

  .use(pagination(pagi)) // Add pagination features

  .use(permalinks(perm)) // Add permalinks to site

  .use(wordcount({
    raw: word
  }))

  .use(layouts(configTemplate)) // Add layout to site

  .use(assets(assetsOpts)) // Add assets to site

  // Minify website
  .use(htmlmin('*.html',minify))
  .use(cssmin(cssminify))

  // Debug and print any errors in console
  .use(debug(log))
  .use(browsersync({
    server: './bin/',
    files:  ['./src/**/**/*', './src/**/*', './src/*',
      'assets/*'],
    port: 8080,
    injectChanges: false
  }), function(err) {
    if (err) { throw err; }
  })

  // Build site and call exceptions when things go wrong
  .build(function(err) {
    if (err) { throw err; }
    else { console.log("Build complete.\n") }
  });


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
