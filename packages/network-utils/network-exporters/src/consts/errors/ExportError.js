/**
 * Used to indicate an error with a request to a data manager; for example,
 * an incorrect, missing, or malformed filename when importing a protocol.
 *
 * API services can use this to distinguish between client input errors and
 * unexpected (server) errors.
 */
class ExportError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ExportError';
  }
}

const ErrorMessages = {
  NoTmpFS: 'Couldn\'t create a temporary directory for the export.',
  EmptyFilelist: 'Empty filelist',
  InvalidFormat: 'Invalid format',
  FilelistNotSingular: 'Multiple files must be uploaded separately',
  InvalidContainerFile: 'Invalid file',
  InvalidContainerFileExtension: 'File must have a ".netcanvas" extension',
  InvalidProtocolFormat: 'Invalid protocol format',
  InvalidRequestBody: 'Could not parse request data',
  InvalidZip: 'Invalid ZIP file',
  InvalidExportOptions: 'Invalid export options',
  MissingParameters: 'Missing export parameters',
  MissingProtocolFile: 'Missing protocol file',
  NotFound: 'Not found',
  NothingToExport: 'No data available to export',
  VerificationFailed: 'Request verification failed',
};

module.exports = {
  ExportError,
  ErrorMessages,
};
