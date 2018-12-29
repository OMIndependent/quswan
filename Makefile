LAYOUTS = $(wildcard layouts/*.pug)
ASSETS=assets

css: ${ASSETS}/*.css

build: ${LAYOUTS} css node_modules
	npm run start

node_modules: package.json

.PHONY: build
