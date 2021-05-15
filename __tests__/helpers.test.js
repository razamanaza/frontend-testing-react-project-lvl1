import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import {
  getFilename, getParams, getResources, replaceResources,
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
