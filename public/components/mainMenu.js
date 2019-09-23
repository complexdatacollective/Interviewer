const { dialog } = require('electron');
const Updater = require('./Updater');
const { openDialog } = require('./dialogs');

const openFile = window =>
  () =>
    openDialog()
      .then(filePath => window.webContents.send('OPEN_FILE', filePath))
      .catch(err => console.log(err));


const updater = Updater();

// Check for updates once, when the mainMenu is initialized.
// Don't notify the user if there aren't updates.
if (!process.env.TEST) {
  updater.checkForUpdates(true);
}

const MenuTemplate = (window) => {
  const menu = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Import Protocol...',
          click: openFile(window),
        },
        {
          label: 'Reset Data...',
          click: () => {
            dialog.showMessageBox({
              message: 'Destroy all application files and data?',
              detail: 'This includes all application settings, imported protocols, and interview data.',
              buttons: ['Reset Data', 'Cancel'],
            }, (response) => {
              if (response === 0) {
                window.webContents.send('RESET_STATE');
              }
            });
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { type: 'separator' },
        { role: 'selectall' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetzoom' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Develop',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
      ],
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
      ],
    },
  ];

  const appMenu = [
    { role: 'about' },
    {
      label: 'Check for updates...',
      click: () => updater.checkForUpdates(),
    },
    { type: 'separator' },
    { role: 'quit' },
  ];

  if (process.platform !== 'darwin') {
    // Use File> menu for Windows
    menu[0].submenu.concat(appMenu);
  } else {
    // Use "App" menu for OS X
    menu.unshift({
      submenu: appMenu,
    });
  }

  return menu;
};

module.exports = MenuTemplate;
