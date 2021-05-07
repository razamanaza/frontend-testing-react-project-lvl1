import axios from 'axios';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import getFilename from './helpers';

axios.defaults.adapter = require('axios/lib/adapters/http');

const pageLoader = async (url, dstdir = os.tmpdir()) => {
  const html = await axios.get(url);
  const filepath = path.join(dstdir, getFilename(url));
  fs.writeFileSync(filepath, html.data, 'utf-8');
  return filepath;
};

export default pageLoader;
