import { matchPath } from 'react-router-dom';

const SessionPath = '/session/:sessionId/:stageIndex';

const matchSessionPath = (pathname) => matchPath(pathname, { path: SessionPath });

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
};
