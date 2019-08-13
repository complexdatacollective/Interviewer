const url = require('url');
const path = require('path');
const log = require('./log');

const appUrl = (function getAppUrl() {
  if (
    (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') && process.env.NC_DEVSERVER_FILE
  ) {
    // This method is more robust than Architect & Server to support multiple platforms & devices
    // NC_DEVSERVER_FILE contains the URL of a running webpack-dev-server, relative to app root
    try {
      const relativePath = path.join(__dirname, '..', '..', process.env.NC_DEVSERVER_FILE);
      return require('fs').readFileSync(relativePath, 'utf-8'); // eslint-disable-line global-require
    } catch (err) {
      log.warn('Error loading dev server config -', err.message);
      log.warn('Are you running dev server?');
      log.warn('Continuing with index.html');
    }
  }
  return url.format({
    pathname: path.join(__dirname, '..', 'index.html'),
    protocol: 'file:',
  });
}());

module.exports = appUrl;
