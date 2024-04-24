// See: https://medium.com/@TwitterArchiveEraser/notarize-electron-apps-7a5f988406db

const fs = require('fs');
const path = require('path');
const electronNotarize = require('@electron/notarize');

async function note(params) {
  // Only notarize the app on macOS.
  if (process.platform !== 'darwin') {
    return;
  }

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
      appleApiKey: '~/.private_keys/AuthKey_A78M67RCH9.p8',
      appleApiKeyId: 'A78M67RCH9', // Taken from https://appstoreconnect.apple.com/access/integrations/api
      appleApiIssuer: '69a6de92-60bf-47e3-e053-5b8c7c11a4d1',// As above
    });

    console.log('Done notarizing');
  } catch (error) {
    console.error(error);
  }


}

module.exports = note;
