const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const request = require('request');
const { paths } = require('./config');

const getDataFileName = (url) => {
  const shasum = crypto.createHash('sha1');
  shasum.update(url);
  const cacheName = shasum.digest('hex');
  const parsedUrl = new URL(url);
  const extName = path.extname(parsedUrl.pathname);
  const fileName = `${cacheName}${extName}`;
  const fullPath = path.join(paths.dataDir, fileName);
  return [fullPath, fileName];
};

const getData = url =>
  new Promise((resolve) => {
    const [fullPath, fileName] = getDataFileName(url);

    console.log(`getData ${url} -> ${fileName}`);

    if (fs.existsSync(fullPath)) {
      console.log(`getData  ${fileName} in cache`);
      resolve([fullPath, fileName]);
      return;
    }

    const writeStream = fs.createWriteStream(fullPath);

    writeStream.on('close', () => {
      console.log(`getData fetched  ${fileName} from network`);
      resolve([fullPath, fileName]);
    });

    request(url).pipe(writeStream);
  });

module.exports = getData;
