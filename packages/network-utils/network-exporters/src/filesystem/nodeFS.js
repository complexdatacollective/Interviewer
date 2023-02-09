/* eslint-disable arrow-body-style */
const fs = require('fs-extra');
const path = require('path');
const uuid = require('uuid').v1;

const copyFile = async (src, dest) => {
  return fs.copy(src, dest);
};

const readFile = async (filePath) => {
  return fs.readFile(filePath);
};

const writeFile = async (filePath, data) => {
  // fs.outputFile will create path if it doesn't exist
  return fs.outputFile(filePath, data);
};

const createWriteStream = async (filePath) => {
  // Open for writing 'w', 'x' for fail if exists.
  const fileHandle = await fs.open(filePath, 'wx');
  return fileHandle.createWriteStream();
};

const deleteFile = async (filePath) => {
  return fs.remove(filePath);
};

const createDirectory = async (dirPath) => {
  return fs.mkdirp(dirPath);
};

const deleteDirectory = async (dirPath) => {
  return fs.remove(dirPath);
};

const copyDirectory = async (src, dest, overwrite = true, useTempDir = false) => {
  if (useTempDir) {
    let tempDir;
    try {
      tempDir = await createDirectory(path.join(dest, `temp-${uuid()}`));
      await fs.copy(src, tempDir);
      await fs.move(src, dest, { overwrite });
    } catch (err) {
      if (tempDir) {
        await deleteDirectory(tempDir);
      }
      return Promise.reject(err);
    } finally {
      await deleteDirectory(tempDir);
    }

    return Promise.resolve();
  }

  return fs.move(src, dest, { overwrite });
};

const ensurePathExists = async (pathToCheck) => {
  return fs.ensureDir(pathToCheck);
};

const renameFile = async (oldPath, newPath) => {
  try {
    await copyFile(oldPath, newPath);
    await deleteFile(oldPath);
  } catch (err) {
    return Promise.reject(err);
  }

  return Promise.resolve();
};

module.exports = {
  copyFile,
  readFile,
  writeFile,
  renameFile,
  createWriteStream,
  deleteFile,
  copyDirectory,
  createDirectory,
  deleteDirectory,
  ensurePathExists,
};
