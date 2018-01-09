import electron from 'electron';
import path from 'path';
// import fs from 'fs';
import Zip from 'jszip';

const fs = electron.remote.require('fs');

const readFile = filename =>
  new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) { reject(err); }
      resolve(data);
    });
  });

// Import => move file to user dir
// Load => load protocol from user dir

// 1. copy zip to app dir
// 2. unzip
// 3. delete zip

const userDataPath = (electron.app || electron.remote.app).getPath('userData');

const getUserDataFilename = (filename) => {
  const basename = path.basename(filename);
  return path.join(userDataPath, basename);
};

const copyProtocolToApp = (source) => {
  const destination = getUserDataFilename(source);

  console.log('copy', source, destination);

  return new Promise((resolve, reject) => {
    const destinationStream = fs.createWriteStream(destination);
    const sourceStream = fs.createReadStream(source);

    destinationStream.on('close', (err) => {
      if (err) { reject(err); }
      resolve(destination);
    });

    sourceStream.pipe(destinationStream);
  });
};

const extractFile = (zipObject) => {
  const destination = path.join(userDataPath, zipObject.name);

  console.log(destination, zipObject);

  return new Promise((resolve, reject) => {
    zipObject
      .nodeStream()
      .pipe(fs.createWriteStream(destination))
      .on('error', (err) => {
        reject(destination, err);
      })
      .on('finish', () => {
        resolve(destination);
      });
  });
};

const extractDir = (zipObject) => {
  const destination = path.join(userDataPath, zipObject.name);

  console.log(destination, zipObject);

  return new Promise((resolve, reject) => {
    fs.mkdir(destination, (err) => {
      if (err) { reject(err); }
      resolve(destination);
    });
  });
};

const extractProtocol = (protocol) => {
  console.log('extract', protocol);

  return readFile(protocol)
    .then(data => Zip.loadAsync(data))
    .then(zip =>
      Promise.all(
        Object.keys(zip.files)
          .map(filename => zip.files[filename])
          .map(zipObject => (zipObject.dir ? extractDir(zipObject) : extractFile(zipObject))),
      ),
    )
    .then((files) => { console.log(files); });
};

const importer = (filename) => {
  console.log('import', filename);
  return copyProtocolToApp(filename)
    .then(extractProtocol);
};

export default importer;
