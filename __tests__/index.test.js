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
  it.only('load file', async () => {
    const filepath = path.join(process.cwd(), 'profile-photo.jpeg');
    await downloadFile('https://agordeev.com/img/profile-photo.jpeg', filepath);
    expect(fileExists(filepath)).toBe(true);
  });
});

describe('pageLoader', () => {
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
    const params = [
      'https://ru.hexlet.io/courses',
    ];
    const downloadedFile = await pageLoader(params);
    expect(downloadedFile).not.toBeUndefined();
    expect(fileExists(downloadedFile)).toBe(true);
    expect(readFile(downloadedFile)).toEqual(readFile(getFixturePath('index.html')));
  });
});

describe('Real pageLoader', () => {
  it.only('Load', async () => {
    const downloadDir = `${process.cwd()}/../frontend-testing-react-project-lvl1-downloads`;
    const params = [
      '--output',
      downloadDir,
      'https://agordeev.com',
    ];
    const downloadedFile = await pageLoader(params);
    expect(downloadedFile).not.toBeUndefined();
  });
});
