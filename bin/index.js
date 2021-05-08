#!/usr/bin/env node

const pageLoader = require('../dist/index.js');

(async () => {
  await pageLoader(process.argv);
})();
