const revertDevConfig = require('./helpers/dev-server').revertDevConfig;

module.exports = (ctx) => {
  const deferral = ctx.requireCordovaModule('q').defer();

  if (process.env.LIVE_RELOAD) {
    revertDevConfig(ctx);
  }

  deferral.resolve();
  return deferral.promise;
};
