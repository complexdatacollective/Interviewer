const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const request = require('request');
const { paths } = require('./config');

const getDataFileName = (url) => {
  const shasum = crypto.createHash('sha1');
  shasum.update(url);
  const cacheName = shasum.digest('hex');
  const extName = path.extname(url);
  const fileName = `${cacheName}${extName}`;
  const fullPath = path.join(paths.dataDir, fileName);
  return [fullPath, fileName];
};

const getData = url =>
  new Promise((resolve) => {
    const [fullPath, fileName] = getDataFileName(url);

    if (fs.existsSync(fullPath)) {
      resolve([fullPath, fileName]);
      return;
    }

    const writeStream = fs.createWriteStream(fullPath);

    writeStream.on('close', () => {
      resolve([fullPath, fileName]);
    });

    request(url).pipe(writeStream);
  });

module.exports = getData;
