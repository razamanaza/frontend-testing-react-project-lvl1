import axios from 'axios';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import getFilename from './helpers';

const pageLoader = async (url) => {
  const tempdir = os.tmpdir();
  const html = await axios.get(url);
  const filepath = path.join(tempdir, getFilename(url));
  fs.writeFileSync(filepath, JSON.stringify(html), 'utf-8');
  return filepath;
};

export default pageLoader;
