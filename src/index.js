import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import debug from 'debug';
import { program } from 'commander';
import http from 'axios/lib/adapters/http.js';
import {
  getFilename, checkArguments, getResources, replaceResources, slugify,
} from './helpers.js';

const dbg = debug('page-loader');
axios.defaults.adapter = http;

export const downloadFile = async (url, filepath) => {
  try {
    const response = await axios({
      method: 'get',
      url,
      responseType: 'stream',
    });
    if (response.status !== 200) {
      throw new Error(`${response.statusText}`);
    }
    await response.data.pipe(fs.createWriteStream(filepath));
  } catch (e) {
    throw new Error(`Failed to download ${url}. ${e.message}`);
  }
};

export default async (params) => {
  dbg(params);
  let result;
  try {
    program.option('-o, --output <type>', 'output folder', `${process.cwd()}`);
    program.arguments('<url>');
    program.parse(params);
    const { output } = program.opts();
    const url = checkArguments(program.args);
    const { origin } = new URL(url);
    const resp = await axios.get(url);
    const html = resp.data;
    const filePath = `${path.join(output, getFilename(url))}`;
    const fileDir = `${path.join(output, slugify(url))}_files`;
    const resources = getResources(html, origin);
    await fs.promises.mkdir(fileDir, { recursive: true });
    await Promise.all(Object.values(resources).map((res) =>
      downloadFile(res.url, path.join(fileDir, res.filename))));
    const htmlReplaced = await replaceResources(html, resources, fileDir);
    await fs.promises.writeFile(filePath, htmlReplaced, 'utf-8');
    result = `Files downloaded into ${output}`;
  } catch (error) {
    console.error(error.message);
    dbg(error);
    process.exit(1);
  }
  return result;
};
