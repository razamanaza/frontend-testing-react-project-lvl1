#!/usr/bin/env node
import debug from 'debug';
import commander from 'commander';
import pageLoader from '../src/index.js';

const { program } = commander;
const dbg = debug('page-loader');

(async () => {
  program
    .arguments('<url>')
    .option('-o, --output <type>', 'output folder', `${process.cwd()}`)
    .action(async (url, options) => {
      try {
        console.log(await pageLoader(url, options.output));
      } catch (error) {
        console.error(error.message);
        dbg(error);
        process.exit(1);
      }
    });
  await program.parseAsync(process.argv);
})();
