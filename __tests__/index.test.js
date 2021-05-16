/* eslint-disable jest/valid-expect */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import nock from 'nock';
import { fileURLToPath } from 'url';
import { downloadFile, default as pageLoader } from '../src/index';
import { expect, it } from '@jest/globals';
import { formatWithOptions } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
  it('Network errors', async () => {
    nock('https://ru.hexlet.io/')
      .get('/image.jpg')
      .reply(404, 'File not found');
    expect(downloadFile('https://ru.hexlet.io/image.jpg', '/')).rejects.toThrow();
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
  it('input parameters check', () => {
    expect(() => pageLoader('http://ya.ru')).rejects.toThrow('No output folder');
    expect(() => pageLoader()).rejects.toThrow('Invalid url format');
  });
  it('download site.com', async () => {
    nock('https://site.com')
      .get('/blog/about')
      .replyWithFile(200, getFixturePath('site-com-blog-about.html'))
      .get('/blog/about/assets/styles.css')
      .reply(200, 'File content')
      .get('/blog/about')
      .reply(200, 'File content')
      .get('/photos/me.jpg')
      .reply(200, 'File content')
      .get('/assets/scripts.js')
      .reply(200, 'File content');
    const filesDir = path.join(tempdir, 'site-com-blog-about_files');
    await pageLoader('https://site.com/blog/about', tempdir);
    expect(fileExists(path.join(tempdir, 'site-com-blog-about.html'))).toBe(true);
    expect(fileExists(path.join(filesDir, 'site-com-blog-about.html'))).toBe(true);
    expect(fileExists(path.join(filesDir, 'site-com-assets-scripts.js'))).toBe(true);
    expect(fileExists(path.join(filesDir, 'site-com-blog-about-assets-styles.css'))).toBe(true);
    expect(fileExists(path.join(filesDir, 'site-com-photos-me.jpg'))).toBe(true);
    const expected = readFile(getFixturePath('expected/site-com-blog-about.html'));
    const replaced = readFile(path.join(tempdir, 'site-com-blog-about.html'));
    expect(replaced).toEqual(expected);
  });
});
