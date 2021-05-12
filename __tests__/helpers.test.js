import * as path from 'path';
import * as fs from 'fs';
import {
  getFilename, getParams, getImages, replaceImages,
} from '../src/helpers';

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(filename, 'utf-8');

describe('getFilename', () => {
  it('Url to filename', () => {
    expect(getFilename('http://ru.hexlet.io/courses')).toEqual(
      'ru-hexlet-io-courses',
    );
    expect(getFilename()).toEqual('');
  });
  it('Filename url', () => {
    expect(getFilename('http://ru.hexlet.io/assets/image.png', true)).toEqual(
      'ru-hexlet-io-assets-image.png',
    );
  });
});

describe('getParams', () => {
  it('Get all params', () => {
    const params = [
      '--output',
      '/var/tmp',
      'https://ru.hexlet.io/courses',
    ];
    expect(getParams(params)).toMatchObject({
      output: '/var/tmp',
      url: 'https://ru.hexlet.io/courses',
    });
  });
  it('No url provided', () => {
    const params = [
      '--output',
      '/var/tmp',
    ];
    expect(getParams(params)).toEqual({
      error: 'No url were provided',
    });
  });
  it('No output provided', () => {
    const params = [
      'https://ru.hexlet.io/courses',
    ];
    expect(getParams(params)).toMatchObject({
      output: process.cwd(),
      url: 'https://ru.hexlet.io/courses',
    });
  });
  it('Invalid url', () => {
    const params = [
      'mut://ru.hexlet.io/courses',
    ];
    expect(getParams(params)).toEqual({
      error: 'Url is invalid',
    });
  });
});

describe('getImages', () => {
  it('extract images', () => {
    const html = readFile(getFixturePath('getImages.html'));
    expect(getImages(html, 'https://ru.hexlet.io/courses')).toEqual({
      '/assets/professions/nodejs.png': {
        url: 'https://ru.hexlet.io/assets/professions/nodejs.png',
        filename: 'ru-hexlet-io-assets-professions-nodejs.png',
      },
      'assets/image.jpg': {
        url: 'https://ru.hexlet.io/assets/image.jpg',
        filename: 'ru-hexlet-io-assets-image.jpg',
      },
    });
  });
});

describe('replaceImages', () => {
  it('replace images', async () => {
    const html = readFile(getFixturePath('getImages.html'));
    const images = getImages(html, 'https://ru.hexlet.io/courses');
    const replacedFix = readFile(getFixturePath('replacedImages.html'));
    const fileDir = 'ru-hexlet-io-courses_files';
    const replaced = await replaceImages(html, images, fileDir);
    expect(replaced).toEqual(replacedFix);
  });
});
