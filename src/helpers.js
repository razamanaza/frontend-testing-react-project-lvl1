import parser from 'yargs-parser';
import validUrl from 'valid-url';
import * as cheerio from 'cheerio';
import * as path from 'path';

const slugify = (name) => `${name.replace(/^https?:\/\//, '').replace(/[^\w\d]/g, '-')}`;

export const getFilename = (url = '', keepExt = false) => {
  if (keepExt) {
    const ext = url.split('.').slice(-1).join();
    const base = url.split('.').slice(0, -1).join('.');
    return `${slugify(base)}.${ext}`;
  }
  return slugify(url);
};

export const getParams = (params) => {
  const defaultOutput = process.cwd();
  const options = parser(params, { default: { output: defaultOutput } });
  if (options._.length <= 0) {
    return { error: 'No url were provided' };
  }
  const url = options._[0];
  if (!validUrl.isWebUri(url)) {
    return { error: 'Url is invalid' };
  }
  const output = options.output ?? defaultOutput;
  return { output, url };
};

export const getImages = (html, href) => {
  const $ = cheerio.load(html);
  const { origin } = new URL(href);
  const images = {};
  $('img').each(function () {
    const original = $(this).attr('src');
    const newUrl = new URL(original, origin);
    if (newUrl.origin === origin) {
      const url = newUrl.href;
      const filename = `${getFilename(newUrl.href, true)}`;
      images[original] = { url, filename };
    }
  });
  return images;
};

export const replaceImages = async (html, images, fileDir) => {
  const $ = cheerio.load(html);
  $('img').each(function () {
    const src = $(this).attr('src');
    if (images[src]) {
      $(this).attr('src', path.join(fileDir, images[src].filename));
    }
  });
  return $.html();
};
