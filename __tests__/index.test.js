/* eslint-disable jest/valid-expect */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import nock from 'nock';
import pageLoader from '../src/index';

const expected = [
  'site-com-assets-scripts.js',
  'site-com-blog-about.html',
  'site-com-blog-about-assets-styles.css',
  'site-com-photos-me.jpg'
]
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const getExpectedPath = (filename) => path.join(__dirname, '..', '__fixtures__', 'expected', filename);
const readFile = (filename) => fs.readFileSync(filename, 'utf-8');

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
    nock('https://site.com').get('/blog/about').reply(200, readFile(getFixturePath('site-com-blog-about.html')))
      .get('/')
      .reply(200)
      .get('/blog/about/assets/styles.css')
      .reply(200, readFile(getExpectedPath('site-com-blog-about-assets-styles.css')))
      .get('/blog/about')
      .reply(200, readFile(getExpectedPath('site-com-blog-about.html')))
      .get('/photos/me.jpg')
      .reply(200, readFile(getExpectedPath('site-com-photos-me.jpg')))
      .get('/assets/scripts.js')
      .reply(200, readFile(getExpectedPath('site-com-assets-scripts.js')));
  });
  afterEach(() => {
    nock.cleanAll();
  });
  it('Main page', async () => {    
    const downloaded = path.join(tempdir, 'site-com-blog-about.html');    
    await pageLoader('https://site.com/blog/about', tempdir);
    await expect(fs.promises.access(downloaded)).resolves.not.toThrow();
    expect(readFile(downloaded)).toEqual(readFile(getFixturePath('expected-site-com-blog-about.html')));
  });
  it.each(expected)(
    'Check %p asset',
    async (filename) => {
      const expected = getExpectedPath(filename);
      const downloaded = path.join(tempdir, 'site-com-blog-about_files', filename)
      await pageLoader('https://site.com/blog/about', tempdir);
      await expect(fs.promises.access(downloaded)).resolves.not.toThrow();
      await expect(readFile(downloaded)).toEqual(readFile(expected));
    }
  );
});

