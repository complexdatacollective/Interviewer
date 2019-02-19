import { matchPath } from 'react-router-dom';

const ProtocolIdKey = 'protocolId';

const SessionPath = `/session/:sessionId/:${ProtocolIdKey}/:stageIndex`;

const matchSessionPath = pathname => matchPath(pathname, { path: SessionPath });

/**
 * Get a string (ID; sometimes called 'path') which can be used to uniquely identify a protocol
 * in state.installedProtocols.
 * @param {string} pathname full URL path to a session; e.g. '/session/sess1/download/protocol2/0'
 * @return {string} the protocol's "path" (base directory name), e.g. 'protocol2'
 */
const protocolIdFromSessionPath = (pathname) => {
  const pathInfo = matchSessionPath(pathname);
  return pathInfo && pathInfo.params[ProtocolIdKey];
};

const currentStageIndex = (path) => {
  const matchedPath = matchSessionPath(path);
  if (matchedPath) {
    return parseInt(matchedPath.params.stageIndex, 10);
  }
  return 0;
};

export {
  currentStageIndex,
  matchSessionPath,
  protocolIdFromSessionPath,
};
