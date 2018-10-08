import environments from '../environments';
import inEnvironment from '../Environment';
import { readFileAsDataUrl } from '../filesystem';
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

      // FIXME: this will fail on large assets [#681]
      const filename = protocolPath(protocolName, `assets/${assetPath}`);
      return readFileAsDataUrl(filename);
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
