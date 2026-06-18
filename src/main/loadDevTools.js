import log from './log.js';

const loadDevTools = () => {
  if (process.env.NODE_ENV !== 'development') {
    return Promise.resolve(null);
  }

  // Only require devtools-installer in development mode
  // Using dynamic import for dev-only dependency
  return import('electron-devtools-installer')
    .then(
      ({ default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS }) =>
        Promise.all([
          installExtension(REACT_DEVELOPER_TOOLS),
          installExtension(REDUX_DEVTOOLS),
        ]),
    )
    .then((tools) => log.info(`Added Extension:  ${tools.toString()}`))
    .catch((err) => {
      log.warn('An error occurred: ', err);
    });
};

export default loadDevTools;
