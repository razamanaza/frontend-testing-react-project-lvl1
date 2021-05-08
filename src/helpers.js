import parser from 'yargs-parser'

const getFilename = (url = '', ext = 'html') =>
  `${url.replace(/^https?:\/\//, '').replace(/[^\w\d]/g, '-')}.${ext}`;

const getParams = (params) => {
  const defaultOutput = process.cwd(); 
  const options = parser(params, {default: {output: defaultOutput}});
  if(options._.length <= 0) {
    return { error: 'No url were provided' };
  }
  const url = options._[options._.length - 1];
  const output = options.output ?? defaultOutput;
  return { output, url };
}

export { getFilename, getParams };
