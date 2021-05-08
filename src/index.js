import axios from 'axios';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import http from 'axios/lib/adapters/http.js';
import { getFilename,  getParams } from './helpers.js';

axios.defaults.adapter = http;

const pageLoader = async (params) => {
  const { url, output, error } = getParams(params);
  if(error) {
    console.log(error);
    process.exit(1);
  }
  const html = await axios.get(url);
  const filepath = path.join(output, getFilename(url));
  fs.writeFileSync(filepath, html.data, 'utf-8');
  return filepath;
};

export default pageLoader;
