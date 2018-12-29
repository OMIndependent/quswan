LAYOUTS = $(wildcard layouts/*.pug)
ASSETS=assets

css: ${ASSETS}/*.css

build: ${LAYOUTS} css node_modules
	node index.js

node_modules: package.json
	npm run start

.PHONY: build
