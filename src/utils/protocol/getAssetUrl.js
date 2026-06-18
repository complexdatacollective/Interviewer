/**
 * Get asset URL utility with secure API support.
 */

import { pathSync } from '../electronAPI';
import inEnvironment from '../Environment';
import environments from '../environments';
import { resolveFileSystemUrl } from '../filesystem';
import protocolPath from './protocolPath';

const isRequired = (param) => {
  throw new Error(`${param} is required`);
};

const assetUrl = (environment) => {
  if (environment === environments.ELECTRON) {
    return (
      protocolUID = isRequired('protocolUID'),
      assetPath = isRequired('assetPath'),
    ) => {
      const fullPath = pathSync.join(protocolUID, 'assets', assetPath);
      const encodedURI = encodeURIComponent(fullPath);
      return Promise.resolve(`asset://${encodedURI}`);
    };
  }

  if (environment === environments.CAPACITOR) {
    return async (
      protocolUID = isRequired('protocolUID'),
      assetPath = isRequired('assetPath'),
    ) => {
      const sourceFilename = await protocolPath(
        protocolUID,
        `assets/${assetPath}`,
      );
      const entry = await resolveFileSystemUrl(sourceFilename);
      return window.Capacitor.convertFileSrc(entry.toURL());
    };
  }

  if (environment === environments.WEB) {
    return (
      protocolUID = isRequired('protocolUID'),
      assetPath = isRequired('assetPath'),
    ) => Promise.resolve(`/protocols/${protocolUID}/assets/${assetPath}`);
  }

  return () =>
    Promise.reject(new Error('assetUrl is not supported on this platform'));
};

export default inEnvironment(assetUrl);
