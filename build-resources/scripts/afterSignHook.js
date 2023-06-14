// See: https://medium.com/@TwitterArchiveEraser/notarize-electron-apps-7a5f988406db

const fs = require('fs');
const path = require('path');
const electronNotarize = require('@electron/notarize');

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
      tool: 'notarytool',
      appBundleId: 'org.codaco.NetworkCanvasInterviewer6',
      appPath,
      appleApiKey: '~/.private_keys/AuthKey_J58L47W6H9.p8',
      appleApiKeyId: 'J58L47W6H9', // This is taken from the filename of the .p8 file in your icloud drive
      appleApiIssuer: '69a6de92-60bf-47e3-e053-5b8c7c11a4d1',
    });

    console.log('Done notarizing');
  } catch (error) {
    console.error(error);
  }


}

module.exports = note;
