const fs = require('fs');
const path = require('path');
// This file contains the LAN URL for the dev server while running
const DevServerFilename = '.devserver';
const ConfigFilename = 'config.xml';
const BackupConfigFilename = `${ConfigFilename}.original`;

const cordovaContentNode = entry => `<content src="${entry}" />`;

/**
 * Update config.xml:
 * - use dev server for content
 * - on iOS, allow navigation to wildcard
 */
function useDevConfig(ctx) {
  const projRoot = ctx.opts.projectRoot;
  const configXml = path.join(projRoot, ConfigFilename);
  const backupXml = path.join(projRoot, BackupConfigFilename);
  const devServerConf = path.join(projRoot, DevServerFilename);

  let devServerUrl;

  try {
    devServerUrl = fs.readFileSync(devServerConf, 'utf-8');
  } catch (err) {
    return;
  }

  if (!devServerUrl) {
    return;
  }

  if (fs.existsSync(backupXml)) {
    console.warn(`Warning: Backup config already exists. Please check the state of ${ConfigFilename}.`);
    return;
  }

  try {
    fs.copyFileSync(configXml, backupXml);
  } catch (err) {
    console.log(err);
    return;
  }

  try {
    const defaultConfig = fs.readFileSync(configXml, 'utf-8');
    let devConfig = defaultConfig.replace(new RegExp(cordovaContentNode('index.html')), cordovaContentNode(devServerUrl));
    if (ctx.opts.platforms.some(p => (/ios/i).test(p))) {
      const iosPlatform = '<platform name="ios">';
      const allowAllNav = '<allow-navigation href="*" />';
      devConfig = devConfig.replace(iosPlatform, `${iosPlatform}\n${allowAllNav}`);
    }
    if (devConfig) {
      fs.writeFileSync(configXml, devConfig);
    }
  } catch (err) {
    console.warn(err);
  }
}

function revertDevConfig(ctx) {
  const projRoot = ctx.opts.projectRoot;
  const configXml = path.join(projRoot, ConfigFilename);
  const backupXml = path.join(projRoot, BackupConfigFilename);
  const devServerConf = path.join(projRoot, DevServerFilename);

  try {
    fs.copyFileSync(backupXml, configXml);
    fs.unlinkSync(backupXml);
  } catch (err) {
    console.warn(err);
  }
}

module.exports = {
  useDevConfig,
  revertDevConfig,
};
