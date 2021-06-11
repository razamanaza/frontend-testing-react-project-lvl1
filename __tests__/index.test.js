/* eslint-disable jest/valid-expect */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import nock from 'nock';
import pageLoader from '../src/index';

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', 'expected', filename);
const readFile = (filename) => fs.readFileSync(filename, 'utf-8');
const resources = [
  {
    url: '/blog/about',
    fixture: 'site-com-blog-about.html',
  },
  {
    url: '/assets/scripts.js',
    fixture: 'site-com-assets-scripts.js',
  },
  {
    url: '/blog/about/assets/styles.css',
    fixture: 'site-com-blog-about-assets-styles.css',
  },
  {
    url: '/photos/me.jpg',
    fixture: 'site-com-photos-me.jpg',
  },
];

describe('pageLoader postive', () => {
  let tempdir;
  beforeAll(() => {
    nock.disableNetConnect();
  });
  afterAll(() => {
    nock.enableNetConnect();
  });
  beforeEach(() => {
    tempdir = fs.mkdtempSync(path.join(os.tmpdir(), 'page-loader-'));
    const scope = nock('https://site.com').persist();
    resources.forEach(({ url, fixture }) => {
      scope.get(url).reply(200, readFile(getFixturePath(fixture)));
    });
  });
  afterEach(() => {
    nock.cleanAll();
  });
  it('Main page', async () => {
    await pageLoader('https://site.com/blog/about', tempdir);
    const downloadedPath = path.join(tempdir, 'site-com-blog-about.html');
    const downloaded = readFile(downloadedPath);
    const expected = readFile(getFixturePath('site-com-blog-about-replaced.html'));
    expect(fs.promises.access(downloadedPath)).resolves.not.toThrow();
    expect(downloaded).toEqual(expected);
  });
  it.each(resources)(
    'Check $fixture file download',
    async (res) => {
      await pageLoader('https://site.com/blog/about', tempdir);
      const expected = readFile(getFixturePath(res.fixture));
      const downloadedPath = path.join(tempdir, 'site-com-blog-about_files', res.fixture);
      const downloaded = readFile(downloadedPath);
      expect(fs.promises.access(downloadedPath)).resolves.not.toThrow();
      expect(downloaded).toEqual(expected);
    },
  );
});

describe('pageLoader negative', () => {
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
    nock.cleanAll();
  });
  it('Write to restricted dir', async () => {
    const output = ('/sys');
    nock('https://site.com')
      .get('/')
      .reply(200);
    await expect(pageLoader('https://site.com', output)).rejects.toThrow();
  });
  it('Write to not existent dir', async () => {
    const output = ('/blahblah');
    nock('https://site.com')
      .get('/')
      .reply(200);
    await expect(pageLoader('https://site.com', output)).rejects.toThrow();
  });
  it('Network error', async () => {
    nock('https://site.com')
      .get('/')
      .reply(500);
    await expect(pageLoader('https://site.com', tempdir)).rejects.toThrow();
  });
});
