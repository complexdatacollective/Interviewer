/* eslint-disable no-console */
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const paths = require('../config/paths');

const cordovaPlatformMatch = (/^(android|ios)$/);

// Write the LAN URL to a file while running, so that cordova apps can attach
// to the specified dev server.
const devUrlFile = paths.dotdevserver;

// When set to `ios` or `android`, this env var will cause the development server
// to serve (platform-specific) cordova dependencies to the iOS or Android client.
// (Currently, you must make your choice at server startup time.)
const isTargetingCordova = cordovaPlatformMatch.test(process.env.NC_TARGET_PLATFORM);

const isTargetingElectron = process.env.NC_TARGET_PLATFORM === 'electron';

const logPlatformInfo = () => {
  if (isTargetingCordova) {
    console.log(chalk.green('Targeting Cordova platform', process.env.NC_TARGET_PLATFORM));
    console.log(chalk.green(`Live mobile dev available: \`npm run ${process.env.NC_TARGET_PLATFORM}:dev\``));
    console.log(chalk.yellow('Content will only run in an', process.env.NC_TARGET_PLATFORM, 'device or emulator'));
  } else if (isTargetingElectron) {
    console.log(chalk.green('Targeting Electron'));
    console.log(chalk.yellow('Content will only run in electron: `npm run dev:electron`'));
  } else {
    console.log(chalk.cyan('Live mobile dev also available: `npm run dev:[android|ios]`'));
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
    if (serverUrl) {
      fs.writeFileSync(devUrlFile, chalk.stripColor(serverUrl));
    } else {
      console.warn(chalk.red('Could not get this machine\'s IP address. Using localhost instead.'));
      fs.writeFileSync(devUrlFile, 'http://localhost:3000');
    }
  } catch (err) {
    console.warn(chalk.yellow(`Could not write ${devUrlFile}. Live Mobile dev will be unavailable.`));
  }
};

const devServerContentBase = () => {
  const platform = process.env.NC_TARGET_PLATFORM;
  let cordovaBase;
  switch (platform) {
    case 'android':
      cordovaBase = path.resolve(paths.cordovaPlatforms, platform, 'app', 'src', 'main', 'assets', 'www');
      break;
    case 'ios':
      cordovaBase = path.resolve(paths.cordovaPlatforms, platform, 'www');
      break;
    default:
      // Not Cordova
      return paths.appPublic;
  }
  if (!fs.existsSync(cordovaBase)) {
    throw new Error(`Cordova platform unavailable: ${process.env.NC_TARGET_PLATFORM} (tried ${cordovaBase})`);
  }
  return cordovaBase;
};

// Webpack default is 'web'. To get electron working with dev server, use 'electron-renderer'.
const reactBundleTarget = () => (isTargetingElectron ? 'electron-renderer' : 'web');

module.exports = {
  cleanDevUrlFile,
  devServerContentBase,
  isTargetingCordova,
  isTargetingElectron,
  logPlatformInfo,
  makeDevUrlFile,
  reactBundleTarget,
};
