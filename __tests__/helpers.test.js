import { getFilename, getParams } from '../src/helpers';

describe('Helpers', () => {
  it('Url to filename', () => {
    expect(getFilename('https://ru.hexlet.io/courses')).toEqual(
      'ru-hexlet-io-courses.html',
    );
    expect(getFilename()).toEqual('.html');
    expect(getFilename('', 'css')).toEqual('.css');
  });
  it('Get all params', () => {
    const params = [
      '--output',
      '/var/tmp',
      'https://ru.hexlet.io/courses'
    ];
    expect(getParams(params)).toMatchObject({
      output: "/var/tmp",
      url: 'https://ru.hexlet.io/courses'
    });
  });
  it('No url provided', () => {
    const params = [
      '--output',
      '/var/tmp'
    ];
    expect(getParams(params)).toEqual({
      error: 'No url were provided'
    });
  });
  it('No output provided', () => {
    const params = [
      'https://ru.hexlet.io/courses'
    ];
    expect(getParams(params)).toMatchObject({
      output: process.cwd(),
      url: 'https://ru.hexlet.io/courses'
    });
  });
  it('Invalid url', () => {
    const params = [
      'mut://ru.hexlet.io/courses'
    ];
    expect(getParams(params)).toEqual({
      error: 'Url is invalid'
    });
  });
});
