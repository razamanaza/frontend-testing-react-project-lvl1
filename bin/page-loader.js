#!/usr/bin/env node
import commander from 'commander';
import Debug from 'debug';
import pageLoader from '../src/index.js';

// eslint-disable-next-line no-unused-vars
const debug = Debug('page-loader');

const { program } = commander;

(async () => {
  program
    .arguments('<url>')
    .option('-o, --output <type>', 'output folder', process.cwd())
    .description('page-loader is a command line utility to download pages and assets from internet', {
      output: 'output directory to store downloaded files',
      url: 'internet address to download',
    })
    .version('0.0.1', '-v, --version', 'output the current version')
    .action(async (url, options) => {
      try {
        console.log(await pageLoader(url, options.output));
      } catch (error) {
        console.error(error.message);
        process.exit(1);
      }
    });
  program.parse(process.argv);
})();
