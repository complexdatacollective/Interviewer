/* eslint-disable no-console */
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const paths = require('../config/paths');

// Write the LAN URL to a file while running, so that cordova apps can attach
// to the specified dev server.
const devUrlFile = paths.dotdevserver;

// When set to `ios` or `android`, this env var will cause the development server
// to serve (platform-specific) cordova dependencies to the iOS or Android client.
// (Currently, you must make your choice at server startup time.)
const isTargetingCordova = process.env.NC_DEV_CORDOVA_PLATFORM;

const logCordovaPlatformInfo = () => {
  if (process.env.NC_DEV_CORDOVA_PLATFORM) {
    console.log(chalk.green('Using Cordova platform', process.env.NC_DEV_CORDOVA_PLATFORM));
    console.log(chalk.green('Live mobile dev available: `npm run dev:', process.env.NC_DEV_CORDOVA_PLATFORM, '`'));
    console.log(chalk.yellow('Content will only run in an', process.env.NC_DEV_CORDOVA_PLATFORM, 'device or emulator'));
  } else {
    console.log(chalk.cyan('Live mobile dev also available: `npm run dev:[ios|android]`'));
  }
};

// Removes the dotfile from the system.
const cleanDevUrlFile = () => {
  try {
    fs.unlinkSync(devUrlFile);
  } catch (err) {
    console.warn(err);
  }
};

// Adds a dotfile to identify the local development server (see `devUrlFile` above)
const makeDevUrlFile = (serverUrl) => {
  try {
    fs.writeFileSync(devUrlFile, chalk.stripColor(serverUrl));
  } catch (err) {
    console.warn(chalk.yellow(`Could not write ${devUrlFile}. Live Mobile dev will be unavailable.`));
  }
};

const devServerContentBase = () => {
  const platformBase = process.env.NC_DEV_CORDOVA_PLATFORM && path.resolve(paths.cordovaPlatforms, process.env.NC_DEV_CORDOVA_PLATFORM, 'www');
  if (!platformBase) {
    return paths.appPublic;
  }
  if (!fs.existsSync(platformBase)) {
    throw new Error(`Cordova platform unavailable: ${process.env.NC_DEV_CORDOVA_PLATFORM} (tried ${platformBase})`);
  }
  return platformBase;
};

module.exports = {
  cleanDevUrlFile,
  devServerContentBase,
  isTargetingCordova,
  logCordovaPlatformInfo,
  makeDevUrlFile,
};
