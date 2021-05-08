import axios from 'axios';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import http from 'axios/lib/adapters/http.js';
import getFilename from './helpers.js';

axios.defaults.adapter = http;

const pageLoader = async (params) => {
  console.log(params);
  const url = 'https://stackoverflow.com/';
  const dstdir = os.tmpdir();
  const html = await axios.get(url);
  const filepath = path.join(dstdir, getFilename(url));
  fs.writeFileSync(filepath, html.data, 'utf-8');
  return filepath;
};

export default pageLoader;
