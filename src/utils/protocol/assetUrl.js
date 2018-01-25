/* global cordova */

import environments from '../environments';
import inEnvironment from '../Environment';
import { readFile } from '../filesystem';
import protocolPath from './protocolPath';

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
      const filename = protocolPath(protocolName, `assets/${assetPath}`);
      console.log(filename);
      return readFile(filename, 'base64');
    }
  }

  throw Error();
};

// file:///var/containers/Bundle/Application/8C8F1D9C-0129-4843-977C-9478612DC8CA/NetworkCanvas.app/www/static/media/node-bin.d63dfe53.svg
// http://localhost:8080/var/mobile/Containers/Data/Application/4B82DA43-B384-4AD3-A21A-AE19A7066ABE/Documents/demo.canvas/demo.canvas/assets/rubberduck.jpg
// `cdvfile://localhost/persistent/${protocolName}/${protocolName}/assets/${assetPath}`; // TODO: WORK AROUND MALFORMED PATHS
// const foo = (`${cordova.file.documentsDirectory}demo.canvas/demo.canvas/assets/rubberduck.jpg`).replace('file://', 'http://localhost:8080');
// console.log(foo);
// return foo;

window.assetUrl = inEnvironment(assetUrl);

export default inEnvironment(assetUrl);
