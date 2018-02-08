import environments from '../environments';
import inEnvironment from '../Environment';
import { readFileAsDataUrl } from '../filesystem';
import protocolPath from './protocolPath';
import factoryProtocolPath from './factoryProtocolPath';

const isRequired = (param) => { throw new Error(`${param} is required`); };

const assetUrl = (environment) => {
  if (environment === environments.ELECTRON) {
    return (
      protocolName = isRequired('protocolName'),
      assetPath = isRequired('assetPath'),
    ) =>
      Promise.resolve(`asset://${protocolName}/assets/${assetPath}`);
  }

  if (environment === environments.CORDOVA) {
    return (
      protocolName = isRequired('protocolName'),
      assetPath = isRequired('assetPath'),
    ) => {
      const factoryFilename = factoryProtocolPath(protocolName, `assets/${assetPath}`);
      const filename = protocolPath(protocolName, `assets/${assetPath}`);
      return readFileAsDataUrl(factoryFilename)
        .catch(readFileAsDataUrl(filename));
    };
  }

  if (environment === environments.WEB) {
    return (
      protocolName = isRequired('protocolName'),
      assetPath = isRequired('assetPath'),
    ) =>
      Promise.resolve(`/protocols/${protocolName}/assets/${assetPath}`);
  }

  throw Error();
};

export default inEnvironment(assetUrl);
