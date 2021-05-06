import getFilename from '../src/helpers';

it('Url to filename', () => {
  expect(getFilename('https://ru.hexlet.io/courses')).toEqual(
    'ru-hexlet-io-courses.html',
  );
  expect(getFilename()).toEqual('.html');
  expect(getFilename('', 'css')).toEqual('.css');
});
