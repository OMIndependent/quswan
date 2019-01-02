#!/usr/bin/env node
// This file generates the static website using Metalsmith plugins.

// Do not use any unneeded vars when running
'use strict'

// Import html and url for redirects, url to move posts to HTTPS site
var http			  = require('http')
var url				  = require('url')

// Import plugins
const pkg             = require('./package.json')

const Metalsmith      = require('metalsmith')
const publish         = require('metalsmith-publish')
const drafts          = require('metalsmith-drafts')
const collections     = require('metalsmith-collections')
const images          = require('metalsmith-scan-images')
const assets          = require('metalsmith-assets')
const pug             = require('metalsmith-pug')
const markdown        = require('metalsmith-markdown')
const emoji           = require('metalsmith-emoji')
const msmoment        = require('metalsmith-moment')
const layouts         = require('metalsmith-layouts')
const permalinks      = require('metalsmith-permalinks')
const pagination      = require('metalsmith-pagination')
const wordcount       = require('metalsmith-word-count')
const htmlmin         = require('metalsmith-html-minifier')
const cssmin          = require('metalsmith-clean-css')
const imgmin          = require('metalsmith-imagemin')
const sitemap         = require('metalsmith-mapsite')
const browsersync     = require('metalsmith-browser-sync')

/* Global settings */
const desc = 'The Socially Aware Magic Swordsman\'s reviews and playthroughs blog generated with Metalsmith'
const numPosts = 10
const entryPattern = ['posts/*.md', 'liveblogs/**/*.md', '!liveblogs/**/index.*',
  '!liveblogs/**/masterlist.*', 'trivia/**/*']
var destDir = './build/'

/* Global metadata */
var meta = {
  site: {
    title: 'Quesada\'s Swan | ',
    url: 'https://quswan.net/'
  },
  name: 'Quesada\'s Swan',
  description: desc,
  generator: 'Metalsmith',
  generatorurl: 'http://metalsmith.io/',
  version: pkg.version
}

/* Directory paths */
var dir = {
  base: __dirname,
  source: './src/',
  dest: destDir
}

/* Collections metadata list */
var collexions = {
  home: {
    metadata: {
      layout: 'home.pug'
    }
  },
  entries: {
    pattern: entryPattern,
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
  lists: {
    pattern: 'liveblogs/**/masterlist.md',
    metadata: {
      layout: 'page.pug'
    }
  },
  transcripts: {
    pattern: ['transcripts/**/*.md', '!transcripts/**/index.*'],
    metadata: {
      layout: 'page.pug'
    }
  }
}

/* Pug plugin settings */
var opts = {
  pretty: false,
  useMetadata: true
}

/* Emoji settings */
var emset = {
  pattern: ['**/*.md', '**/**/*.md', '**/*.html', '**/**/*.html'],
  convertToImages: true,
  processShortnames: true
}

/* Moment time format settings */
/* NOTE: 'date' is taken from markdown file's YAML front matter.
Input date formats accepted are:
  "YYYY-MM-DD HH:mm:ss +-HHmm" or "YYYY-MM-DD Z+-HHmm" ->
  "2020-07-01 15:03:25 -0700" or "2020-07-01 09-0700"
The output date format returns:
  "dddd, MMMM Do, YYYY" -> "X-day, July 1st, 2020" */
/* 'broadcastDate' is also used for TV shows released on
different days. */
var mtime = ['date']

/* Permalink settings */
var perm = {
  relative: false
}

/* Pagination settings */
var pagi = {
  'collections.entries': {
    perPage: numPosts,
    layout: 'home.pug',
    first: 'index.html',
    noPageOne: true,
    path: 'page/:num/index.html'
  }
}

/* Post publish settings */
var publishOpts = {
  draft: true,
  private: true,
  unlisted: true
}

/* Template/layout engine plugin settings */
var configTemplate = {
  engine: 'pug',
  directory: 'layouts',
  default: 'layout.pug'
}

/* Image gallery parsing */
var imgPattern = 'src/**/**/gallery.*'

/* Assets settings */
var assetsOpts = {
  source: './assets',
  destination: './assets'
}

// Clean build directory or not?
var clean = true

// Output word count. When false, use readingTime instead.
var word = false

/* HTML minifier settings */
var minify = {
  collapseBooleanAttributes: false,
  collapseWhitespace: false
}

/* CSS minifier settings */
var cssminify = {
  files: ['assets/*.css', 'assets/**/*.css']
}

/* Image minifier settings */
var imgminify = {
  optimizationLevel: 3,
  svgoPlugins: [{
    removeViewBox: false
  }]
}

// Toggle debug
var log = false

// Localhost port
var port = 8080

Metalsmith(dir.base)
  .clean(clean) // Clean the build directory
  .metadata(meta) // Get metadata
  .source(dir.source) // Get source files from './src/' directory
  .destination(dir.dest) // Place final web files into destination directory

  .use(publish(publishOpts)) // Add plugin for drafts, queued, and private posts

  .use(drafts()) // Enable drafts for posts

  .use(collections(collexions)) // Sort posts into collections

  .use(pug(opts)) // Enable pug-to-HTML files

  .use(emoji(emset)) // Enable emoji in files

  .use(markdown()) // Enable markdown-to-HTML files

  .use(images(imgPattern)) // Enable image gallery generator

  .use(msmoment(mtime)) // Add ms-moment plugin

  .use(pagination(pagi)) // Add pagination feature

  .use(permalinks(perm)) // Add permalink feature

  .use(wordcount({
    raw: word
  })) // Measure reading time instead of word count

  .use(layouts(configTemplate)) // Add layout to site

  .use(assets(assetsOpts)) // Add assets to site

  // Minify/compress files
  .use(htmlmin('*.html', minify))
  .use(cssmin(cssminify))
  .use(imgmin(imgminify))

  .use(sitemap(meta.site.url)) // Print xml file of sitemap for search engines

  // Debug and print any errors in console
  .use(debug(log))
  .use(browsersync({
    server: destDir,
    files: ['./src/**/**/*', './src/**/*', './src/*',
      'assets/*'], // Note changes in these files
    port: port,
    injectChanges: false,
    codeSync: false
  }), function (err) {
    if (err) { throw err }
  })

  // Build site and call exceptions when things go wrong
  .build(function (err) {
    if (err) { throw err } else { console.log('Build complete.\n') }
  })

/* Redirect to HTTPS site */
http.createServer( (req, res) => {
   var pathname = url.parse(req.url).pathname
   res.writeHead(301, {Location: meta.site.url + pathname})
   res.end()
}).listen(port)

// Debug function to check if website loads correctly
function debug(log) {
  return function(files, Metalsmith, done) {
    if (log) {
      console.log('\nMETADATA:')
      console.log(Metalsmith.metadata())

      for (var f in files) {
        console.log('\nFILE:')
        console.log(files[f])
      }

      console.log('\nCOLLECTIONS:')
      console.log(Metalsmith.metadata().collections)
    }
    done()
  }
}