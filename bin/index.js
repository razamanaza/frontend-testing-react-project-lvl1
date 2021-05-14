#!/usr/bin/env node

const pageLoader = require('../dist/index.js').default;

(async () => {
  await pageLoader(process.argv.slice(2));
})();
