const path = require('path');
const paths = require('./paths');

const resolveAlias = {
  '~': paths.appSrc,
  '~behaviours': path.join(paths.appSrc, 'behaviours'),
  '~components': path.join(paths.appSrc, 'components'),
  '~containers': path.join(paths.appSrc, 'containers'),
  '~contexts': path.join(paths.appSrc, 'contexts'),
  '~ducks': path.join(paths.appSrc, 'ducks'),
  '~hooks': path.join(paths.appSrc, 'hooks'),
  '~images': path.join(paths.appSrc, 'images'),
  '~selectors': path.join(paths.appSrc, 'selectors'),
  '~utils': path.join(paths.appSrc, 'utils'),
  '@codaco/shared-consts': require.resolve('@codaco/shared-consts/dist/index.js'),
};

module.exports = {
  resolveAlias,
};
