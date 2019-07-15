/* eslint-disable global-require */

import { removeDirectory } from '../filesystem';
import getProtocolPath from './protocolPath';

const deleteProtocol = (protocolUID) => {
  const protocolPath = getProtocolPath(protocolUID);
  return removeDirectory(protocolPath);
}

export default deleteProtocol;
