import * as fs from 'fs';
import pageLoader from '../src/index';

const fileExists = (file) => {
  try {
    fs.accessSync(file, fs.constants.R_OK || fs.constants.W_OK);
    return true;
  } catch (err) {
    return false;
  }
};

describe('page download', () => {
  it('file check', async () => {
    const downloadedFile = await pageLoader('https://ru.hexlet.io/courses');
    expect(downloadedFile).not.toBeUndefined();
    expect(fileExists(downloadedFile)).toBe(true);
  });
});
