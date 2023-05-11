// See: https://medium.com/@TwitterArchiveEraser/notarize-electron-apps-7a5f988406db

const fs = require('fs');
const path = require('path');
const electronNotarize = require('electron-notarize');

async function note(params) {
  // Only notarize the app on Mac OS only.
  if (process.platform !== 'darwin') {
    return;
  }
  console.log('afterSign hook triggered', params);

  const appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);
  if (!fs.existsSync(appPath)) {
    throw new Error(`Cannot find application at: ${appPath}`);
  }

  console.log(`Notarizing app found at ${appPath}`);

  try {
    await electronNotarize.notarize({
      appBundleId: 'org.codaco.NetworkCanvasInterviewer6',
      appPath,
      appleId: 'developers@coda.co',
      appleIdPassword: '@keychain:AC_PASSWORD',
    });
  } catch (error) {
    console.error(error);
  }

  console.log('Done notarizing');
}

module.exports = note;
