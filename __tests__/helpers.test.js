import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import {
  getFilename, checkArguments, getResources, replaceResources,
} from '../src/helpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(filename, 'utf-8');

describe('getFilename', () => {
  it('Url to filename', () => {
    expect(getFilename('http://ru.hexlet.io/courses')).toEqual(
      'ru-hexlet-io-courses.html',
    );
  });
  it('Filename url', () => {
    expect(getFilename('http://ru.hexlet.io/assets/image.png', true)).toEqual(
      'ru-hexlet-io-assets-image.png',
    );
  });
});

describe('checkArguments', () => {
  it('Check correct args', () => {
    const url = 'http://ya.ru';
    expect(checkArguments([url])).toEqual(url);
  });
  it('Check empty args', () => {
    expect(() => checkArguments([])).toThrow();
  });
  it('More than one url', () => {
    expect(() => checkArguments(['http://ya.ru', 'https://o.com'])).toThrow();
  });
  it('Wrong url', () => {
    expect(() => checkArguments(['fakeprotocol://ya.ru'])).toThrow();
  });
});

describe('getResources', () => {
  it('extract images', () => {
    const html = readFile(getFixturePath('getResources.html'));
    const extractedResources = JSON.parse(readFile(getFixturePath('resources.json')));
    expect(getResources(html, 'https://ru.hexlet.io/courses')).toEqual(extractedResources);
  });
});

describe('replaceResources', () => {
  it('replace resources', async () => {
    const html = readFile(getFixturePath('getResources.html'));
    const images = getResources(html, 'https://ru.hexlet.io/courses');
    const replacedFix = readFile(getFixturePath('replacedResources.html'));
    const fileDir = 'ru-hexlet-io-courses_files';
    const replaced = await replaceResources(html, images, fileDir);
    expect(replaced).toEqual(replacedFix);
  });
});
