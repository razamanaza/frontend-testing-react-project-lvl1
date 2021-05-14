/* eslint-disable import/extensions */
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import debug from 'debug';
import http from 'axios/lib/adapters/http.js';
import {
  getFilename, getParams, getResources, replaceResources, slugify,
} from './helpers.js';

const dbg = debug('page-loader');
axios.defaults.adapter = http;

const exitApp = (error) => {
  console.error(error.message);
  process.exit(1);
};

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
    dbg(e);
    throw new Error(`Failed to download ${url}. ${e.message}`);
  }
};

const pageLoader = async (params) => {
  dbg(`Started with params: ${params}`);
  const { url, output, error } = getParams(params);
  dbg(`output dir: ${output}`);
  dbg(`cwd: ${process.cwd()}`);
  if (error) {
    exitApp(error);
  }
  const { origin } = new URL(url);
  let resp;
  try {
    resp = await axios.get(url);
  } catch (e) {
    exitApp(e);
  }
  const html = resp.data;
  const filePath = `${path.join(output, getFilename(url))}`;
  const fileDir = `${path.join(output, slugify(url))}_files`;
  const resources = getResources(html, origin);
  try {
    await fs.promises.mkdir(fileDir, { recursive: true });
    await Promise.all(Object.values(resources).map((res) =>
      downloadFile(res.url, path.join(fileDir, res.filename))));
    const result = await replaceResources(html, resources, fileDir);
    await fs.promises.writeFile(filePath, result, 'utf-8');
  } catch (e) {
    exitApp(e);
  }
  console.log(`Files downloaded into ${filePath}`);
};

export default pageLoader;
