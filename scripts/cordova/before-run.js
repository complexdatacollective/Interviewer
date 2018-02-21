const useDevConfig = require('./helpers/dev-server').useDevConfig;

module.exports = (ctx) => {
  const deferral = ctx.requireCordovaModule('q').defer();

  if (process.env.LIVE_RELOAD) {
    useDevConfig(ctx);
  }

  deferral.resolve();
  return deferral.promise;
};
