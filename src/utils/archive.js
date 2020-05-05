const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const JSZip = require('jszip');
const isElectron = require('./Environment').isElectron;
const isCordova = require('./Environment').isCordova;
const getEnvironment = require('./Environment').getEnvironment;


// const zlibFastestCompression = 1;
// const zlibBestCompression = 9;
const zlibDefaultCompression = -1;

// Use zlib default: compromise speed & size
// archiver overrides zlib's default (with 'best speed'), so we need to provide it
const archiveOptions = {
  zlib: { level: zlibDefaultCompression },
  store: true,
};

/**
 * Write a bundled (zip) from source files
 * @param {string} destinationPath full FS path to write
 * @param {string[]} sourcePaths
 * @return Returns a promise that resolves to (sourcePath, destinationPath)
 */
const archiveElectron = (sourcePaths, destinationPath) =>
  new Promise((resolve, reject) => {
    const output = fs.createWriteStream(destinationPath);
    const zip = archiver('zip', archiveOptions);

    output.on('close', () => {
      resolve(destinationPath);
    });

    output.on('warning', reject);
    output.on('error', reject);

    zip.pipe(output);

    zip.on('warning', reject);
    zip.on('error', reject);

    sourcePaths.forEach((sourcePath) => {
      zip.append(fs.createReadStream(sourcePath), { name: path.basename(sourcePath) });
    });

    zip.finalize();
  });

const getFile = (filename, fileSystem) => new Promise((resolve, reject) => {
  fileSystem.root.getFile(filename, { create: false, exclusive: false },
    fileEntry => resolve(fileEntry),
    err => reject(err),
  );
});

const createReader = fileEntry => new Promise((resolve, reject) => {
  fileEntry.file(
    file => resolve(file),
    err => reject(err),
  );
});

/**
 * Write a bundled (zip) from source files
 * @param {object} filesystem filesystem to use for reading files in to zip
 * @param {object} fileWriter fileWriter to use for outputting zip
 * @param {string} targetFileName full FS path to write
 * @param {string[]} sourcePaths
 * @return Returns a promise that resolves to (sourcePath, destinationPath)
 */
const archiveCordova = (sourcePaths, targetFileName, fileWriter, filesystem) => {
  const zip = new JSZip();
  const promisedExports = sourcePaths.map(
    sourcePath => getFile(sourcePath, filesystem)
      .then(createReader)
      .then(file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = data => resolve(zip.file(file.name, data.target.result));
        reader.onerror = err => reject(err);
        reader.readAsText(file);
      })));

  return new Promise((resolve, reject) => {
    Promise.all(promisedExports).then(() => {
      zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } }).then((blob) => {
        fileWriter.seek(0);
        fileWriter.onwrite = () => resolve(targetFileName); // eslint-disable-line no-param-reassign
        fileWriter.onerror = err => reject(err); // eslint-disable-line no-param-reassign
        fileWriter.write(blob);
      });
    });
  });
};

/**
 * Write a bundled (zip) from source files
 * @param {object} filesystem filesystem to use for reading files in to zip
 * @param {object} fileWriter fileWriter to use for outputting zip
 * @param {string} targetFileName full FS path to write
 * @param {string[]} sourcePaths
 * @return Returns a promise that resolves to (sourcePath, destinationPath)
 */
const archive = (sourcePaths, targetFileName, fileWriter, filesystem) => {
  if (isElectron()) {
    return archiveElectron(sourcePaths, targetFileName);
  }

  if (isCordova()) {
    return archiveCordova(sourcePaths, targetFileName, fileWriter, filesystem);
  }

  throw new Error(`zip archiving not available on platform ${getEnvironment()}`);
};

// This is adapted from Architect; consider using `extract` as well
module.exports = {
  archive,
};
