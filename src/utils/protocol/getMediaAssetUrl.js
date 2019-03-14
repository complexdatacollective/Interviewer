/* global device */

import environments from '../environments';
import inEnvironment from '../Environment';
import { makeTmpDirCopy, resolveFileSystemUrl } from '../filesystem';
import getAssetUrl from './getAssetUrl';

/**
 * An enchanced version of assetUrl, which returns urls suitable for streaming
 * video/audio on cordova.
 */
const mediaAssetUrl = (environment) => {
  if (environment === environments.CORDOVA) {
    return (
      protocolName,
      assetPath,
    ) => {
      // Android supports native URLs to the permanent filesystem
      if ((/Android/i).test(device.platform)) {
        return getAssetUrl(protocolName, assetPath)
          .then(resolveFileSystemUrl)
          .then(url => url.nativeURL);
      }

      // iOS will happily serve video assets from the tmp directory
      // files stored in a flat hierarchy under tmp/; prepend protocolName to ensure uniqueness
      const tmpFilename = `${protocolName}-${assetPath}`;
      return getAssetUrl(protocolName, assetPath)
        .then(sourceFilename => makeTmpDirCopy(sourceFilename, tmpFilename))
        .then(fileEntry => fileEntry.nativeURL)
        .catch((err) => {
          console.error(err); // eslint-disable-line no-console
          return '';
        });
    };
  }
  console.log('in electron so passing to getAssertURL');
  return getAssetUrl;
};

export default inEnvironment(mediaAssetUrl);
