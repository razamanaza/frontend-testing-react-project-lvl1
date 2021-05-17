import cheerio from 'cheerio';
import * as path from 'path';

const resTypes = [
  { tag: 'img', link: 'src' },
  { tag: 'link', link: 'href' },
  { tag: 'script', link: 'src' },
];
export const slugify = (name) => `${name.replace(/^https?:\/\//, '').replace(/[^\w\d]/g, '-')}`;

export const getFilename = (url) => {
  const { pathname } = new URL(url);
  const ext = pathname.match(/\.[0-9a-z]+$/i) ? pathname.match(/\.[0-9a-z]+$/i)[0] : '.html';
  const extRegex = new RegExp(`${ext}$`, 'g');
  const base = url.replace(extRegex, '');
  return `${slugify(base)}${ext}`;
};

export const getResources = (html, href) => {
  const $ = cheerio.load(html);
  const { origin } = new URL(href);
  const resources = {};
  resTypes.forEach((res) => {
    $(res.tag).each(function () {
      const original = $(this).attr(res.link);
      if (!original) {
        return;
      }
      const newUrl = new URL(original, origin);
      if (newUrl.origin === origin) {
        const url = newUrl.href;
        const filename = `${getFilename(newUrl.href)}`;
        resources[original] = { url, filename };
      }
    });
  });
  return resources;
};

export const replaceResources = async (html, images, fileDir) => {
  const $ = cheerio.load(html, { decodeEntities: false });
  resTypes.forEach((res) => {
    $(res.tag).each(function () {
      const src = $(this).attr(res.link);
      if (images[src]) {
        $(this).attr(res.link, path.join(fileDir, images[src].filename));
      }
    });
  });
  return $.html();
};
