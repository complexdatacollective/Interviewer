import Promise from 'bluebird';
import filesystem from '../filesystem';
import { protocolPath } from './';
import { isCordova, isElectron } from '../Environment';

const getProtocolFile = (protocolName) => {
  if (isCordova()) {
    return Promise.reject('Local protocol file not yet supported in Cordova');
  } else if (isElectron()) {
    return filesystem.readFile(protocolPath(protocolName, 'protocol.json'), 'utf8')
      .then(data => JSON.parse(data));
  }

  return Promise.reject('Environment not recognised');
};

const getProtocol = source => getProtocolFile(source);

export default getProtocol;
