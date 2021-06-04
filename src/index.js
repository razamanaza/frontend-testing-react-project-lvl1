import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import validUrl from 'valid-url';
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
    const buffer = Buffer.from(response.data);
    await fs.promises.writeFile(filepath, buffer);
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
  const rs = getResources(html, origin);
  await fs.promises.mkdir(fileDir, { recursive: true });
  await Promise.all(
    Object.values(rs).map((res) => downloadFile(res.url, path.join(fileDir, res.filename))),
  );
  const htmlReplaced = await replaceResources(html, rs, `${slugify(url)}_files`);
  await fs.promises.writeFile(filePath, htmlReplaced, 'utf-8');
  return `${output}`;
};
