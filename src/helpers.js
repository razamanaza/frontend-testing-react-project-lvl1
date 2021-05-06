const getFilename = (url = '', ext = 'html') =>
  `${url.replace(/^https?:\/\//, '').replace(/[^\w\d]/g, '-')}.${ext}`;

export default getFilename;
