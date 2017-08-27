build: node_modules
	node index.js

node_modules: package.json
	npm run build

.PHONY: build
