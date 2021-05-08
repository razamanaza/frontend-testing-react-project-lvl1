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
      '/usr/bin/node',
      '/usr/bin/page-loader',
      '--output',
      '/var/tmp',
      'https://ru.hexlet.io/courses'
    ];
    expect(getParams(params)).toMatchObject({
      output: "/var/tmp",
      url: 'https://ru.hexlet.io/courses'
    })
  })
});
