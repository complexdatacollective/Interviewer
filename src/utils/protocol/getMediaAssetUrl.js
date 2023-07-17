/* global device */

import inEnvironment, { isIOS } from '../Environment';
import environments from '../environments';
import getAssetUrl from './getAssetUrl';


/**
 * Creates a temp file from a given source filename if it doesn't already exist.
 * This is useful on iOS, where video can be served using native file:// URLs.
 * Note that this should not be needed on Android, but if called there, the
 * cache directory will be used.
 *
 * Resolves with the fileEntry of the temp file.
 *
 * @param {string} sourceFilename existing file on the permanent FS
 * @param {string} tmpFilename unique name for the temporary file
 * @async
 *
 */
const makeTmpDirCopy = inEnvironment((environment) => {
  if (environment === environments.CORDOVA) {
    return (sourceFilename, tmpFilename) => new Promise((resolve, reject) => {
      window.requestFileSystem(window.TEMPORARY, 0, (tempFs) => {
        tempFs.root.getFile(tmpFilename, { create: false }, (fileEntry) => {
          resolve(fileEntry); // Temp file already exists
        }, () => {
          window.resolveLocalFileSystemURL(sourceFilename, (sourceEntry) => {
            sourceEntry.copyTo(tempFs.root, tmpFilename, resolve, reject);
          }, reject);
        });
      }, reject);
    });
  }

  throw new Error(`makeTmpDirCopy() not available on platform ${environment}`);
});

/**
 * An enhanced version of assetUrl, which returns urls suitable for streaming
 * video/audio on cordova.
 */
const getMediaAssetUrl = (protocolName, assetPath) => {
  // if (isIOS()) {
  //   // iOS doesn't support cdvfile:// urls (limitation of wkwebview), so we need to copy
  //   // the file to a temporary directory and return a file:// url.

  //   // files stored in a flat hierarchy under tmp/; prepend protocolName to ensure uniqueness
  //   const tmpFilename = `${protocolName}-${assetPath}`;
  //   return getAssetUrl(protocolName, assetPath)
  //     .then(sourceFilename => makeTmpDirCopy(sourceFilename, tmpFilename))
  //     .then(fileEntry => {
  //       console.log('fileEntry', fileEntry, fileEntry.toURL(), window.WkWebView.convertFilePath(fileEntry.toURL())); // eslint-disable-line no-console
  //       return window.WkWebView.convertFilePath(fileEntry.toURL());
  //     })
  //     .catch((err) => {
  //       console.error(err); // eslint-disable-line no-console
  //       return '';
  //     });
  // }

  if (isIOS()) {
    return getAssetUrl(protocolName, assetPath)
      .then(sourceFilename => {
        const convertedPath = window.WkWebView.convertFilePath(sourceFilename);
        console.log('convertedPath', convertedPath, sourceFilename, convertedPath == sourceFilename); // eslint-disable-line no-console
        return window.WkWebView.convertFilePath(sourceFilename);
      });
  }

  return getAssetUrl(protocolName, assetPath);
};

export default getMediaAssetUrl;
