import parser from 'yargs-parser'
import validUrl  from 'valid-url';

const getFilename = (url = '', ext = 'html') =>
  `${url.replace(/^https?:\/\//, '').replace(/[^\w\d]/g, '-')}.${ext}`;

const getParams = (params) => {
  const defaultOutput = process.cwd(); 
  const options = parser(params, {default: {output: defaultOutput}});
  if(options._.length <= 0) {
    return { error: 'No url were provided' };
  }
  const url = options._[0];
  if(!validUrl.isWebUri(url)) {
    return { error: 'Url is invalid' };
  }
  const output = options.output ?? defaultOutput;
  return { output, url };
}

export { getFilename, getParams };
