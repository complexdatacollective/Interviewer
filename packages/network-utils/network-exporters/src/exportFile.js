const path = require('path');
const {
  getFileExtensionForType,
  makeFilename,
} = require('./utils/general');
const getFormatterClass = require('./utils/getFormatterClass');
const { ExportError } = require('./consts/errors/ExportError');
const UserCancelledExport = require('./consts/errors/UserCancelledExport');

/**
 * Export a single (CSV or graphml) file
 * @param  {string}   namePrefix used to construct the filename
 * @param  {string}   partitionedEntityName an entity name used by CSV formatters
 * @param  {formats}  exportFormat a special config object that specifies the formatter class
 * @param  {string}   outDir directory where we should write the file
 * @param  {object}   network NC-formatted network `({ nodes, edges, ego })`
 * @param  {Object}   codebook needed to lookup variable types for encoding
 * @param  {Object}   exportOptions the new style configuration object, passed through to
 *                    the formatter
 * @param  {Object}   filesystemInterface an object with methods for interacting with the
 * @return {Promise}  promise decorated with an `abort` method.
 *                    If aborted, the returned promise will never settle.
 * @private
 */
const exportFile = (
  namePrefix,
  partitonedEntityName,
  exportFormat,
  outDir,
  network,
  codebook,
  filesystemInterface,
  exportSettings,
) => {
  const Formatter = getFormatterClass(exportFormat);
  const extension = getFileExtensionForType(exportFormat);

  if (!Formatter || !extension) {
    return Promise.reject(new ExportError(`Invalid export format ${exportFormat}`));
  }

  // Establish variables to hold the stream controller (needed to handle abort method)
  // and the stream itself.
  let streamController;
  let writeStream;
  let promiseResolve;
  let promiseReject;

  // Create a promise
  const pathPromise = new Promise((resolve, reject) => {
    promiseResolve = resolve;
    promiseReject = reject;

    const formatter = new Formatter(network, codebook, exportSettings);

    const outputName = makeFilename(namePrefix, partitonedEntityName, exportFormat, extension);
    const filePath = path.join(outDir, outputName);

    filesystemInterface.createWriteStream(filePath)
      .then((ws) => {
        writeStream = ws;
        writeStream.on('finish', () => {
          promiseResolve(filePath);
        });
        writeStream.on('error', (err) => {
          promiseReject(err);
        });

        streamController = formatter.writeToStream(writeStream);
      });
  });

  // Decorate the promise with an abort method that also tears down the
  // streamController and the writeStream
  pathPromise.abort = () => {
    if (streamController) {
      streamController.abort();
    }
    if (writeStream) {
      writeStream.destroy();
    }

    promiseReject(new UserCancelledExport());
  };

  return pathPromise;
};

module.exports = exportFile;
