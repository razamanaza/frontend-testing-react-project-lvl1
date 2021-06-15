import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import validUrl from 'valid-url';
// eslint-disable-next-line no-unused-vars
import * as axiosDebug from 'axios-debug-log';
import {
  getFilename, getResources, replaceResources, slugify,
} from './helpers.js';

const downloadFile = async (url, filepath) => {
  try {
    const response = await axios({
      method: 'get',
      url,
      responseType: 'arraybuffer',
    });
    if (response.status !== 200) {
      throw new Error(`${response.statusText}`);
    }
    await fs.promises.writeFile(filepath, response.data);
  } catch (e) {
    throw new Error(`Failed to download ${url}. ${e.message}`);
  }
};

export default async (url, output) => {
  if (!validUrl.isWebUri(url)) {
    throw new Error('Invalid url format');
  }
  if (!output) {
    throw new Error('Invalid output');
  }
  const { origin } = new URL(url);
  const resp = await axios.get(url);
  const html = resp.data;
  const filePath = path.join(output, getFilename(url));
  const fileDir = `${path.join(output, slugify(url))}_files`;
  const rs = getResources(html, origin);
  await fs.promises.mkdir(fileDir, { recursive: true });
  await Promise.all(
    Object.values(rs).map((res) => downloadFile(res.url, path.join(fileDir, res.filename))),
  );
  const htmlReplaced = await replaceResources(html, rs, `${slugify(url)}_files`);
  await fs.promises.writeFile(filePath, htmlReplaced, 'utf-8');
  return { filepath: filePath };
};
