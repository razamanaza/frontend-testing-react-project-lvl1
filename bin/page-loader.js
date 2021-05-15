#!/usr/bin/env node

import pageLoader from '../index.js';

(async () => {
  console.log(await pageLoader(process.argv.slice(2)));
})();
