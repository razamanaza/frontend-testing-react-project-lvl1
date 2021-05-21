import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import debug from 'debug';
import validUrl from 'valid-url';
import http from 'axios/lib/adapters/http.js';
import {
  getFilename, getResources, replaceResources, slugify,
} from './helpers.js';

const dbg = debug('page-loader');
axios.defaults.adapter = http;

export const downloadFile = async (url, filepath) => {
  try {
    // const response = await axios({
    //   method: 'get',
    //   url,
    //   responseType: 'stream',
    // });
    // if (response.status !== 200) {
    //   throw new Error(`${response.statusText}`);
    // }
    // await response.data.pipe(fs.createWriteStream(filepath));
    await fs.promises.writeFile(filepath, 'something');
  } catch (e) {
    throw new Error(`Failed to download ${url}. ${e.message}`);
  }
};

export default async (url, output = process.cwd()) => {
  if (!validUrl.isWebUri(url)) {
    throw new Error('Invalid url format');
  }
  const { origin } = new URL(url);
  const resp = await axios.get(url);
  const html = resp.data;
  const filePath = `${path.join(output, getFilename(url))}`;
  const fileDir = `${path.join(output, slugify(url))}_files`;
  const resources = getResources(html, origin);
  await fs.promises.mkdir(fileDir, { recursive: true });
  await Promise.all(Object.values(resources).map((res) =>
    downloadFile(res.url, path.join(fileDir, res.filename))));
  const htmlReplaced = await replaceResources(html, resources, `${slugify(url)}_files`);
  await fs.promises.writeFile(filePath, htmlReplaced, 'utf-8');
  return `Files downloaded into ${output}`;
};
