import { isElectron, isCordova } from './Environment';

const saveFile = (data, openErrorDialog, filterName, extensions, defaultFileName, fileType,
  shareOptions) => {
  if (isElectron()) { // electron save dialog
    const { dialog } = window.electron.remote;
    dialog.showSaveDialog({ filters: [{ name: filterName, extensions }] }, (filename) => {
      if (filename === undefined) return;
      window.fs.writeFile(filename, data, (err) => {
        if (err) {
          dialog.showErrorBox('Error Saving File.', err.message);
        }
      });
    });
  } else if (isCordova()) { // cordova save temp file and then share
    const getFileSystem = () => new Promise((resolve, reject) => {
      window.requestFileSystem(
        window.LocalFileSystem.TEMPORARY,
        5 * 1024 * 1024,
        fileSystem => resolve(fileSystem),
        err => reject(err),
      );
    });

    const getFile = fileSystem => new Promise((resolve, reject) => {
      fileSystem.root.getFile(defaultFileName, { create: true, exclusive: false },
        fileEntry => resolve(fileEntry),
        err => reject(err),
      );
    });

    const createWriter = fileEntry => new Promise((resolve, reject) => {
      fileEntry.createWriter(
        fileWriter => resolve({ fileWriter, filename: fileEntry.toURL() }),
        err => reject(err),
      );
    });

    const writeFile = ({ fileWriter, filename }) => new Promise((resolve, reject) => {
      const blob = new Blob([data], { type: fileType });
      fileWriter.seek(0);
      fileWriter.onwrite = () => resolve(filename); // eslint-disable-line no-param-reassign
      fileWriter.onerror = err => reject(err); // eslint-disable-line no-param-reassign
      fileWriter.write(blob);
    });

    getFileSystem()
      .then(getFile)
      .then(createWriter)
      .then(writeFile)
      .then((filename) => {
        const options = {
          message: 'Your network canvas file.', // not supported on some apps
          subject: 'network canvas export',
          files: [filename],
          chooserTitle: 'Share file via', // Android only
          ...shareOptions,
        };
        window.plugins.socialsharing.shareWithOptions(options);
      })
      .catch(() => { openErrorDialog(); });
  } else { // browser save to downloads
    const blob = new Blob([data], { type: fileType });
    const element = document.createElement('a');
    element.setAttribute('href', window.URL.createObjectURL(blob));
    element.setAttribute('download', defaultFileName);
    element.style.display = 'none';
    document.getElementById('root').appendChild(element);
    element.click();
    document.getElementById('root').removeChild(element);
    window.URL.revokeObjectURL(blob);
  }
};

export default saveFile;
