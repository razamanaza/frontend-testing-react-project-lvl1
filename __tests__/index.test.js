/* eslint-disable jest/valid-expect */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import nock from 'nock';
import debug from 'debug';
import pageLoader from '../src/index';

const dbg = debug('page-loader');
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(filename, 'utf-8');

describe('pageLoader', () => {
  let tempdir;
  let data;
  beforeAll(() => {
    nock.disableNetConnect();
  });
  afterAll(() => {
    nock.enableNetConnect();
  });
  beforeEach(() => {
    tempdir = fs.mkdtempSync(path.join(os.tmpdir(), 'page-loader-'));
    nock('https://site.com').get('/blog/about').reply(200, readFile(getFixturePath('site-com-blog-about.html')))
      .get('/blog/about/assets/styles.css').reply(200, 'css')
      .get('/blog/about').reply(200, 'html')
      .get('/photos/me.jpg').reply(200, 'img')
      .get('/assets/scripts.js').reply(200, 'js');
  });
  afterEach(() => {
    nock.cleanAll();
  });
  it('input parameters check', () => {
    expect(() => pageLoader()).rejects.toThrow();
  });
  it('download main html', async () => {
    const downloaded = path.join(tempdir, 'site-com-blog-about.html');
    await pageLoader('https://site.com/blog/about', tempdir);
    await expect(fs.promises.access(downloaded)).resolves.not.toThrow();
    expect(readFile(downloaded)).toEqual(readFile(getFixturePath('expected-site-com-blog-about.html')));
  });
  it('download assets', async () => {
    const assetsDir = path.join(tempdir, 'site-com-blog-about_files');
    await pageLoader('https://site.com/blog/about', tempdir);

    // js
    const js = path.join(assetsDir, 'site-com-assets-scripts.js');
    await expect(fs.promises.access(js)).resolves.not.toThrow();
    await expect(readFile(js)).toEqual('js');

    // css
    const css = path.join(assetsDir, 'site-com-blog-about-assets-styles.css');
    await expect(fs.promises.access(css)).resolves.not.toThrow();
    await expect(readFile(css)).toEqual('css');

    // img
    const img = path.join(assetsDir, 'site-com-photos-me.jpg');
    await expect(fs.promises.access(img)).resolves.not.toThrow();
    await expect(readFile(img)).toEqual('img');

    // html
    const html = path.join(assetsDir, 'site-com-blog-about.html');
    await expect(fs.promises.access(html)).resolves.not.toThrow();
    await expect(readFile(html)).toEqual('html');
  });
});
