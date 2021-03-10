const { dialog } = require('electron');
const { openDialog } = require('./dialogs');

const openFile = (window) => () => openDialog()
  .then((filePath) => window.webContents.send('OPEN_FILE', filePath))
  .catch((err) => console.log(err));

const MenuTemplate = (window) => {
  const appMenu = [
    { role: 'about' },
    {
      label: 'Settings...',
      click: () => window.webContents.send('OPEN_SETTINGS_MENU'),
    },
    { type: 'separator' },
    { role: 'quit' },
  ];

  const menu = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Import Protocol from File...',
          click: openFile(window),
        },
        {
          label: 'Exit Current Interview',
          click: () => window.webContents.send('EXIT_INTERVIEW'),
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
        { role: 'reload' },
        { role: 'forcereload' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Develop',
      submenu: [
        { role: 'toggledevtools' },
        { type: 'separator' },
        {
          label: 'Reset App Data...',
          click: () => {
            dialog.showMessageBox({
              message: 'Destroy all application files and data?',
              detail: 'This includes all application settings, imported protocols, and interview data.',
              buttons: ['Reset Data', 'Cancel'],
            })
              .then(({ response }) => {
                if (response === 0) {
                  window.webContents.send('RESET_STATE');
                }
              });
          },
        },
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

  if (process.platform !== 'darwin') {
    // Use File> menu for Windows
    menu[0].submenu = menu[0].submenu.concat(appMenu);
  } else {
    // Use "App" menu for OS X
    menu.unshift({
      label: 'App',
      submenu: appMenu,
    });
  }

  return menu;
};

module.exports = MenuTemplate;
