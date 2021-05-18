/* eslint-disable jest/valid-expect */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import nock from 'nock';
import debug from 'debug';
import { downloadFile, default as pageLoader } from '../src/index';

const dbg = debug('page-loader');
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = async (filename) => fs.promises.writeFile(filename, 'utf-8');

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
  });
  // it('load file', async () => {
  //   const filepath = path.join(tempdir, 'image.jpg');
  //   nock('https://ru.hexlet.io')
  //     .get('/image.jpg')
  //     .replyWithFile(200, getFixturePath('image.jpg'));
  //   await downloadFile('https://ru.hexlet.io/image.jpg', filepath);
  //   expect(fileExists(filepath)).toBe(true);
  // });
  it('Network errors', async () => {
    nock('https://ru.hexlet.io/')
      .get('/image.jpg')
      .reply(404, 'File not found');
    expect(downloadFile('https://ru.hexlet.io/image.jpg', '/')).rejects.toThrow();
  });
});

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
        output: path.join(outputFilesDir, 'site-com-blog-about.html'),
        expected: path.join(expectedFilesDir, 'site-com-blog-about.html'),
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
      .replyWithFile(200, data.html.input, {
        'Content-Type': 'text/html',
      })
      .get('/blog/about/assets/styles.css')
      .replyWithFile(200, data.css.input, {
        'Content-Type': 'text/css',
      })
      .get('/blog/about')
      .replyWithFile(200, data.htmlAsset.input, {
        'Content-Type': 'text/html',
      })
      .get('/photos/me.jpg')
      .replyWithFile(200, data.img.input, {
        'Content-Type': 'image/jpeg',
      })
      .get('/assets/scripts.js')
      .replyWithFile(200, data.js.input, {
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

    expect(fileExists(data.html.output)).toBe(true);
    expect(await readFile(data.html.output)).toEqual(await readFile(data.html.expected));
  });

  it('download asset html', async () => {
    await pageLoader('https://site.com/blog/about', tempdir);

    expect(fileExists(data.htmlAsset.output)).toBe(true);
    expect(await readFile(data.htmlAsset.output)).toEqual(await readFile(data.htmlAsset.expected));
  });

  it('download img', async () => {
    await pageLoader('https://site.com/blog/about', tempdir);

    expect(fileExists(data.img.output)).toBe(true);
    expect(await readFile(data.img.output)).toEqual(await readFile(data.img.expected));
  });

  it('download css', async () => {
    await pageLoader('https://site.com/blog/about', tempdir);

    dbg(await readFile(data.css.output));
    dbg(await readFile(data.css.expected));
    expect(fileExists(data.css.output)).toBe(true);
    expect(await readFile(data.css.output)).toEqual(await readFile(data.css.expected));
  });

  it('download js', async () => {
    await pageLoader('https://site.com/blog/about', tempdir);

    expect(fileExists(data.js.output)).toBe(true);
    expect(await readFile(data.js.output)).toEqual(await readFile(data.js.expected));
  });
});
