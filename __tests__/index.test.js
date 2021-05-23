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
    const outputFilesDir = path.join(tempdir, 'site-com-blog-about_files');
    const expectedFilesDir = path.join(__dirname, '..', '__fixtures__', 'expected', 'site-com-blog-about_files');
    data = {
      html: {
        input: getFixturePath('site-com-blog-about.html'),
        output: path.join(tempdir, 'site-com-blog-about.html'),
        expected: path.join(__dirname, '..', '__fixtures__', 'expected', 'site-com-blog-about.html'),
      },
      htmlAsset: {
        input: path.join(expectedFilesDir, 'site-com-blog-about.html'),
        output: path.join(outputFilesDir, 'site-com-blog-about.html'),
        expected: path.join(expectedFilesDir, 'site-com-blog-about.html'),
      },
      img: {
        input: path.join(expectedFilesDir, 'site-com-photos-me.jpg'),
        output: path.join(outputFilesDir, 'site-com-photos-me.jpg'),
        expected: path.join(expectedFilesDir, 'site-com-photos-me.jpg'),
      },
      js: {
        input: path.join(expectedFilesDir, 'site-com-assets-scripts.js'),
        output: path.join(outputFilesDir, 'site-com-assets-scripts.js'),
        expected: path.join(expectedFilesDir, 'site-com-assets-scripts.js'),
      },
      css: {
        input: path.join(expectedFilesDir, 'site-com-blog-about-assets-styles.css'),
        output: path.join(outputFilesDir, 'site-com-blog-about-assets-styles.css'),
        expected: path.join(expectedFilesDir, 'site-com-blog-about-assets-styles.css'),
      },
    };
    nock('https://site.com')
      .get('/blog/about')
      .reply(200, readFile(data.html.input), {
        'Content-Type': 'text/html',
      })
      .get('/blog/about/assets/styles.css')
      .reply(200, readFile(data.css.input), {
        'Content-Type': 'text/css',
      })
      .get('/blog/about')
      .reply(200, readFile(data.htmlAsset.input), {
        'Content-Type': 'text/html',
      })
      .get('/photos/me.jpg')
      .reply(200, readFile(data.img.input), {
        'Content-Type': 'image/jpeg',
      })
      .get('/assets/scripts.js')
      .reply(200, readFile(data.js.input), {
        'Content-Type': 'text/javascript',
      });
  });
  afterEach(() => {
    nock.cleanAll();
  });
  it('input parameters check', () => {
    expect(() => pageLoader()).rejects.toThrow('Invalid url format');
  });
  it('download main html', async () => {
    await pageLoader('https://site.com/blog/about', tempdir);

    await expect(fs.promises.access(data.html.output)).resolves.not.toThrow();
    expect(readFile(data.html.output)).toEqual(readFile(data.html.expected));
  });

  it('download asset html', async () => {
    await pageLoader('https://site.com/blog/about', tempdir);

    await expect(fs.promises.access(data.htmlAsset.output)).resolves.not.toThrow();
    expect(readFile(data.htmlAsset.output)).toEqual(readFile(data.htmlAsset.expected));
  });

  it('download img', async () => {
    await pageLoader('https://site.com/blog/about', tempdir);

    await expect(fs.promises.access(data.img.output)).resolves.not.toThrow();
    expect(readFile(data.img.output)).toEqual(readFile(data.img.expected));
  });

  it('download css', async () => {
    await pageLoader('https://site.com/blog/about', tempdir);

    await expect(fs.promises.access(data.css.output)).resolves.not.toThrow();
    expect(readFile(data.css.output)).toEqual(readFile(data.css.expected));
  });

  it('download js', async () => {
    await pageLoader('https://site.com/blog/about', tempdir);

    await expect(fs.promises.access(data.js.output)).resolves.not.toThrow();
    expect(readFile(data.js.output)).toEqual(readFile(data.js.expected));
  });
});
