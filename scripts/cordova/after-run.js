const q = require('q');
const revertDevConfig = require('./helpers/dev-server').revertDevConfig;

module.exports = (ctx) => {
  const deferral = q.defer();

  if (process.env.LIVE_RELOAD) {
    revertDevConfig(ctx);
  }

  deferral.resolve();
  return deferral.promise;
};
