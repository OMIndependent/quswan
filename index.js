#!/usr/bin/env node

var pkg           = require("./package.json");

var Metalsmith    = require('metalsmith');
var assets        = require('metalsmith-assets');
var markdown      = require('metalsmith-markdown');
var layouts       = require('metalsmith-layouts');
var permalinks    = require('metalsmith-permalinks');
var mapsite       = require('metalsmith-mapsite');
var pug           = require('metalsmith-pug');

var meta = {
  title: "Ocampo's Moon",
  sitetitle: "Ocampo's Moon",
  siteurl: "http://quswan.net/",
  description: "My personal blog site made by Metalsmith",
  generator: "Metalsmith",
  version:  pkg.version
}; // Metadata here
var opts = {
  pretty: false
}; // For pug plugin options
var clean = true; // Clean build or not?

Metalsmith(__dirname)
  .metadata(meta) // Get metadata
  .source('./src/') // Place source files into '/src/' directory
  .destination('./bin/') // Place final web files into '/bin/' directory
  .clean(clean)  // Clean the build
  .use(markdown()) // Add markdown-to-HTML plugin
  .use(permalinks()) // Add permalinks to site
  .use(pug(opts)) // Add pug-to-HTML plugin
  .use(collections({
    page: {

    },
    post: {

    },
    transcript: {

    }
  }))
  .use(layouts({
    engine: 'handlebars',
    default: "./_layouts/page.html"
  })) // Add 'handlebars' layout to site
  .use(assets({
    source: './assets/'
  })) // Add assets to site
  .build(function(err) {
    if (err) { throw err; }
  }); // Call exceptions when things go wrong loading site
