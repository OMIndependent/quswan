LAYOUTS = $(wildcard _layouts/*.pug)
ASSETS=assets

css: ${ASSETS}/*.css

build: ${LAYOUTS} css node_modules
	node index.js

node_modules: package.json

.PHONY: build
