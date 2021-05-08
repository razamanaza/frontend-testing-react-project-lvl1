import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import nock from 'nock';
import pageLoader from '../src/index';

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(filename, 'utf-8');

const fileExists = (file) => {
  try {
    fs.accessSync(file, fs.constants.R_OK || fs.constants.W_OK);
    return true;
  } catch (err) {
    return false;
  }
};

describe('page download', () => {
  let tempdir;
  beforeAll(() => {
    nock.disableNetConnect();
  });
  afterAll(() => {
    nock.enableNetConnect();
  });
  beforeEach(() => {
    tempdir = fs.mkdtempSync(path.join(os.tmpdir(), 'page-loader-'));
  });
  afterEach(() => {
    fs.rmSync(tempdir, { recursive: true });
  });
  it('file check', async () => {
    nock('https://ru.hexlet.io')
      .get('/courses')
      .replyWithFile(200, getFixturePath('index.html'), {
        'Content-Type': 'text/html',
      });
    const downloadedFile = await pageLoader('https://ru.hexlet.io/courses', tempdir);
    expect(downloadedFile).not.toBeUndefined();
    expect(fileExists(downloadedFile)).toBe(true);
    expect(readFile(downloadedFile)).toEqual(readFile(getFixturePath('index.html')));
  });
});
