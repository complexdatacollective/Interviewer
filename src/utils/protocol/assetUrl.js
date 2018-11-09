/* global device */

import environments from '../environments';
import inEnvironment from '../Environment';
import { makeTmpDirCopy, resolveFileSystemUrl } from '../filesystem';
import protocolPath from './protocolPath';

const isRequired = (param) => { throw new Error(`${param} is required`); };

const assetUrl = (environment) => {
  if (environment === environments.ELECTRON) {
    return (
      protocolName = isRequired('protocolName'),
      assetPath = isRequired('assetPath'),
      /* protocolType, */
    ) =>
      Promise.resolve(`asset://${protocolName}/assets/${assetPath}`);
  }

  if (environment === environments.CORDOVA) {
    return (
      protocolName = isRequired('protocolName'),
      assetPath = isRequired('assetPath'),
      protocolType,
    ) => {
      if (protocolType === 'factory') {
        return Promise.resolve(`protocols/${protocolName}/assets/${assetPath}`);
      }

      const sourceFilename = protocolPath(protocolName, `assets/${assetPath}`);

      // Android supports native URLs to the permanent filesystem
      if ((/Android/i).test(device.platform)) {
        return resolveFileSystemUrl(sourceFilename)
          .then(url => url.nativeURL);
      }

      // iOS will happily serve video assets from the tmp directory
      // files stored in a flat hierarchy under tmp/; prepend protocolName to ensure uniqueness
      const tmpFilename = `${protocolName}-${assetPath}`;
      return makeTmpDirCopy(sourceFilename, tmpFilename)
        .then(fileEntry => fileEntry.nativeURL)
        .catch((err) => {
          console.error(err); // eslint-disable-line no-console
          return '';
        });

      // The original version read binary data to a data:// URL
      // This could be used as a fallback if the asset is small enough
      // (if it's too large, the app will reload or crash).
      // return readFileAsDataUrl(sourceFilename);
    };
  }

  if (environment === environments.WEB) {
    return (
      protocolName = isRequired('protocolName'),
      assetPath = isRequired('assetPath'),
    ) =>
      Promise.resolve(`/protocols/${protocolName}/assets/${assetPath}`);
  }

  return () => Promise.reject(new Error('assetUrl is not supported on this platform'));
};

export default inEnvironment(assetUrl);
