/* eslint-disable jest/valid-expect */
import { readFileSync, constants, accessSync, mkdtempSync, writeFileSync } from 'fs';
import * as path from 'path';
import * as os from 'os';
import nock from 'nock';
import { downloadFile, default as pageLoader } from '../src/index';

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => readFileSync(filename, 'utf-8');

const fileExists = (file) => {
  try {
    accessSync(file, constants.R_OK || constants.W_OK);
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
    tempdir = mkdtempSync(path.join(os.tmpdir(), 'page-loader-'));
  });
  afterEach(() => {
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
    tempdir = mkdtempSync(path.join(os.tmpdir(), 'page-loader-'));
  });
  afterEach(() => {
  });
  it('input parameters check', () => {
    expect(() => pageLoader()).rejects.toThrow('Invalid url format');
  });
  it('download site.com', async () => {
    const html = readFile(getFixturePath('site-com-blog-about.html'));
    nock('https://site.com')
      .get('/blog/about')
      .reply(200, html, {
        'Content-Type': 'text/html',
      })
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
    let content = readFile(path.join(filesDir, 'site-com-assets-scripts.js'));
    expect(content).toEqual('File content');
    expect(fileExists(path.join(filesDir, 'site-com-blog-about-assets-styles.css'))).toBe(true);
    content = readFile(path.join(filesDir, 'site-com-blog-about-assets-styles.css'));
    expect(content).toEqual('File content');
    expect(fileExists(path.join(filesDir, 'site-com-photos-me.jpg'))).toBe(true);
    content = readFile(path.join(filesDir, 'site-com-photos-me.jpg'));
    expect(content).toEqual('File content');
    const expected = readFile(getFixturePath('expected/site-com-blog-about.html'));
    const replaced = readFile(path.join(tempdir, 'site-com-blog-about.html'));
    expect(replaced).toEqual(expected);
  });
  it('download localhost', async () => {
    const html = readFile(getFixturePath('localhost-blog-about.html'));
    nock('http://localhost')
      .get('/blog/about')
      .reply(200, html, {
        'Content-Type': 'text/html',
      })
      .get('/blog/about/assets/styles.css')
      .reply(200, 'File content')
      .get('/blog/about')
      .reply(200, 'File content')
      .get('/photos/me.jpg')
      .reply(200, 'File content')
      .get('/assets/scripts.js')
      .reply(200, 'File content');
    const filesDir = path.join(tempdir, 'localhost-blog-about_files');
    await pageLoader('http://localhost/blog/about', tempdir);
    expect(fileExists(path.join(tempdir, 'localhost-blog-about.html'))).toBe(true);
    expect(fileExists(path.join(filesDir, 'localhost-blog-about.html'))).toBe(true);
    expect(fileExists(path.join(filesDir, 'localhost-assets-scripts.js'))).toBe(true);
    expect(fileExists(path.join(filesDir, 'localhost-blog-about-assets-styles.css'))).toBe(true);
    expect(fileExists(path.join(filesDir, 'localhost-photos-me.jpg'))).toBe(true);
    const expected = readFile(getFixturePath('expected/localhost-blog-about.html'));
    const replaced = readFile(path.join(tempdir, 'localhost-blog-about.html'));
    expect(replaced).toEqual(expected);
  });
});
