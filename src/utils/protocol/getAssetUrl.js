import environments from '../environments';
import inEnvironment from '../Environment';
import protocolPath from './protocolPath';
import { resolveFileSystemUrl } from '../filesystem';

const isRequired = (param) => { throw new Error(`${param} is required`); };

const assetUrl = (environment) => {
  if (environment === environments.ELECTRON) {
    const path = require('path');
    return (
      protocolUID = isRequired('protocolUID'),
      assetPath = isRequired('assetPath'),
    ) => {
      const fullPath = path.join(protocolUID, 'assets', assetPath);
      const encodedURI = encodeURIComponent(fullPath);
      return Promise.resolve(`asset://${encodedURI}`);
    }
  }

  if (environment === environments.CORDOVA) {
    return (
      protocolUID = isRequired('protocolUID'),
      assetPath = isRequired('assetPath'),
    ) => {
      const sourceFilename = protocolPath(protocolUID, `assets/${assetPath}`);
      return resolveFileSystemUrl(sourceFilename).then((url) => {
        const toURL = url.toURL();

        /**
         * If we are in development mode, the path returned by toURL() will
         * include the host's IP address and port, which we use for the hot
         * reload functionality.
         *
         * This will not work with the `WebViewAssetLoader` in Android, which
         * only catches requests to http://localhost
         *
         * We therefore need to replace the host with localhost, and remove the
         * port number, only in development mode.
         */

        if (process.env.NODE_ENV === 'development') {
          console.info('assetUrl: replacing host with localhost');
          const url = new URL(toURL);
          url.host = 'localhost';
          url.port = '';
          return url.toString();
        }

        return toURL;
      });
    };
  }

  if (environment === environments.WEB) {
    return (
      protocolUID = isRequired('protocolUID'),
      assetPath = isRequired('assetPath'),
    ) =>
      Promise.resolve(`/protocols/${protocolUID}/assets/${assetPath}`);
  }

  return () => Promise.reject(new Error('assetUrl is not supported on this platform'));
};

export default inEnvironment(assetUrl);
