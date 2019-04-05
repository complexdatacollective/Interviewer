import environments from '../environments';
import inEnvironment from '../Environment';
import protocolPath from './protocolPath';

const isRequired = (param) => { throw new Error(`${param} is required`); };

const assetUrl = (environment) => {
  if (environment === environments.ELECTRON) {
    return (
      protocolUID = isRequired('protocolUID'),
      assetPath = isRequired('assetPath'),
    ) => Promise.resolve(`asset://${protocolUID}/assets/${assetPath}`);
  }

  if (environment === environments.CORDOVA) {
    return (
      protocolUID = isRequired('protocolUID'),
      assetPath = isRequired('assetPath'),
    ) => {
      const sourceFilename = protocolPath(protocolUID, `assets/${assetPath}`);

      return Promise.resolve(sourceFilename);
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
