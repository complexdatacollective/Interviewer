/* global device */

import inEnvironment, { isIOS } from '../Environment';
import { makeTmpDirCopy, resolveFileSystemUrl } from '../filesystem';
import getAssetUrl from './getAssetUrl';

/**
 * An enhanced version of assetUrl, which returns urls suitable for streaming
 * video/audio on cordova.
 */
const getMediaAssetUrl = (protocolName, assetPath) => {
  if (isIOS()) {
    // iOS doesn't support cdvfile:// urls (limitation of wkwebview), so we need to copy
    // the file to a temporary directory and return a file:// url.

    // files stored in a flat hierarchy under tmp/; prepend protocolName to ensure uniqueness
    const tmpFilename = `${protocolName}-${assetPath}`;
    return getAssetUrl(protocolName, assetPath)
      .then(sourceFilename => makeTmpDirCopy(sourceFilename, tmpFilename))
      .then(fileEntry => fileEntry.nativeURL)
      .catch((err) => {
        console.error(err); // eslint-disable-line no-console
        return '';
      });
  }

  return getAssetUrl(protocolName, assetPath);
};

export default getMediaAssetUrl;
