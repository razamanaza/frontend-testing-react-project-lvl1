import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import nock from 'nock';
import pageLoader, { downloadFile } from '../src/index';

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

describe('downloadFile', () => {
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
  it('load file', async () => {
    const filepath = path.join(tempdir, 'image.jpg');
    nock('https://ru.hexlet.io/')
      .get('/image.jpg')
      .replyWithFile(200, getFixturePath('image.jpg'), {
        'Content-Type': 'image/jpeg',
      });
    await downloadFile('https://ru.hexlet.io/image.jpg', filepath);
    expect(fileExists(filepath)).toBe(true);
  });
  it.only('Network errors', async () => {
    nock('https://ru.hexlet.io/')
      .get('/image.jpg')
      .reply(404, 'File not found');
    expect(downloadFile('https://ru.hexlet.io/image.jpg', '/')).rejects.toThrow();
  });
});

describe('Real pageLoader', () => {
  it('Load', async () => {
    const downloadDir = '../frontend-testing-react-project-lvl1-downloads';
    const params = [
      '--output',
      downloadDir,
      'https://agordeev.com',
    ];
    const downloadedFile = await pageLoader(params);
  });
});
