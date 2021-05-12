/* eslint-disable import/extensions */
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import http from 'axios/lib/adapters/http.js';
import { getFilename, getParams, getImages, replaceImages } from './helpers.js';

axios.defaults.adapter = http;

export const downloadFile = async (url, filepath) => {
  try {
    const response = await axios({
      method: 'get',
      url,
      responseType: 'stream',
    });
    await response.data.pipe(fs.createWriteStream(filepath));
  } catch (e) {
    console.log(e);
  }
};

const pageLoader = async (params) => {
  const { url, output, error } = getParams(params);
  if (error) {
    console.log(error);
    process.exit(1);
  }
  const { origin, pathname } = new URL(url);
  const html = (await axios.get(url)).data;
  const filePath = `${path.join(output, getFilename(url))}.html`;
  const fileDir = `${path.join(output, getFilename(url))}_files`;
  const images = getImages(html, origin);
  await fs.promises.mkdir(fileDir, { recursive: true });
  await Promise.all(Object.values(images).map((image) => 
    downloadFile(image.url, path.join(fileDir, image.filename))));
  const htmlWithLocalImages = await replaceImages(html, images, fileDir);
  await fs.promises.writeFile(filePath, htmlWithLocalImages, 'utf-8');
  return filePath;
};

export default pageLoader;
