const { isEmpty, groupBy } = require('lodash');
const uuid = require('uuid').v4;
const path = require('path');
const { EventEmitter } = require('eventemitter3');
const queue = require('async/queue');
const {
  protocolProperty,
} = require('@codaco/shared-consts');
const exportFile = require('./exportFile');
const {
  insertEgoIntoSessionNetworks,
  resequenceIds,
  partitionNetworkByType,
  unionOfNetworks,
} = require('./formatters/network');
const {
  verifySessionVariables,
  getFilePrefix,
  getFileExportListFromFormats,
  makeOptions,
  makeFormats,
} = require('./utils/general');
const { ExportError, ErrorMessages } = require('./consts/errors/ExportError');
const ProgressMessages = require('./consts/ProgressMessages');
const UserCancelledExport = require('./consts/errors/UserCancelledExport');
const MockFSInterface = require('./filesystem/testFs');
const { SUPPORTED_FORMATS } = require('./consts/export-consts');

/**
 * Interface for all data exports
 */
class FileExportManager {
  constructor(fsInterface = MockFSInterface) {
    if (!fsInterface) {
      throw new Error('Filesystem interface is required');
    }

    this.eventEmitter = new EventEmitter();
    this.fsInterface = fsInterface;
  }

  static getSupportedFormats() {
    return SUPPORTED_FORMATS;
  }

  on(...args) {
    this.eventEmitter.on(...args);
  }

  emit(event, payload) {
    if (!event) {
      // eslint-disable-next-line no-console
      console.warn('Malformed emit.');
      return;
    }

    this.eventEmitter.emit(event, payload);
  }

  removeAllListeners() {
    this.eventEmitter.removeAllListeners();
  }

  /**
   * Main export method. Returns a promise that resolves an to an object
   * containing an object with run() and abort() methods that control the task.
   *
   * Rejections from this method are fatal errors, but errors within
   * the run() task only fail that specific task.
   *
   * @param {*} sessions    collection of session objects
   * @param {*} protocols   object keyed by protocolUID (SHA of protocol.name), where each
   *                        protocols[protocolUID] is a complete protocol object,
   *                        including codebook. Must contain a key for every session
   *                        protocol in the sessions collection.
   */
  prepareExportJob(
    sessions,
    protocols,
    userFormats = ['graphml'],
    userOptions = {},
  ) {
    // Merge user supplied options with defaults
    const options = makeOptions(userOptions);
    const formats = makeFormats(userFormats);

    const tempDirectoryName = `temp-export-${uuid()}`;
    const tempDirectoryPath = path.join(options.tempDataPath, tempDirectoryName);

    // This queue instance accepts one or more promises and limits their
    // concurrency for better usability in consuming apps
    // https://caolan.github.io/async/v3/docs.html#queue
    // TODO: refactor this to use web workers
    const q = queue((task, callback) => {
      task()
        .then((result) => callback(null, result))
        .catch((error) => callback(error));
    }, options.queueConcurrency);

    // Returns an array containing each file type that needs to be created.
    const exportFormats = getFileExportListFromFormats(
      formats,
      options.csvIncludeAdjacencyMatrix,
      options.csvIncludeAttributeList,
      options.csvIncludeEdgeList,
    );

    // Cleanup function called by abort method, after fatal errors, and after
    // the export promise resolves.
    const cleanUp = () => {
      q.kill();
      this.fsInterface.deleteDirectory(tempDirectoryPath);
    };

    // Reject if required parameters aren't provided
    if (
      (!sessions || isEmpty(sessions))
      || (!protocols || isEmpty(protocols))
    ) {
      throw new ExportError(ErrorMessages.MissingParameters);
    }

    let cancelled = false;
    const completedExports = [];
    const failedExports = [];

    const shouldContinue = () => !cancelled;

    // Main work of the process happens here
    const run = () => new Promise((resolveRun, rejectRun) => {
      this.emit('begin', ProgressMessages.Begin);

      this.fsInterface.createDirectory(tempDirectoryPath)
        .then(() => {
          if (!shouldContinue()) {
            throw new UserCancelledExport();
          }
        })
        // Insert a reference to the ego ID into all nodes and edges
        .then(() => {
          this.emit('update', ProgressMessages.Formatting);
          // Insert a reference to the ego ID into all nodes and edges
          return insertEgoIntoSessionNetworks(sessions);
        })
        // Resequence IDs for this export
        .then(resequenceIds)
        // Group sessions by protocol UUID
        .then((sessionsWithResequencedIDs) => groupBy(sessionsWithResequencedIDs, `sessionVariables.${protocolProperty}`))
        // Then, process the union option
        .then((sessionsByProtocol) => {
          if (!shouldContinue()) {
            throw new UserCancelledExport();
          }

          if (!options.unifyNetworks) {
            return sessionsByProtocol;
          }

          this.emit('update', ProgressMessages.Merging);
          return unionOfNetworks(sessionsByProtocol);
        })
        .then((unifiedSessions) => {
          if (!shouldContinue()) {
            throw new UserCancelledExport();
          }

          // Create an array of promises representing each session in each export format
          const finishedSessions = [];

          // Create a variable representing the total work to be done, so we can report progress
          const sessionExportTotal = options.unifyNetworks
            ? Object.keys(unifiedSessions).length : sessions.length;

          // Array to contain all export work to be done
          const promisedExports = [];

          Object.keys(unifiedSessions).forEach((protocolUID) => {
            // Reject if no protocol was provided for this session
            if (!protocols[protocolUID]) {
              const error = `No protocol was provided for the session. Looked for protocolUID ${protocolUID}`;
              this.emit('error', error);
              failedExports.push(error);
              return;
            }

            unifiedSessions[protocolUID].forEach((session) => {
              // Skip if sessions don't have required sessionVariables
              try {
                if (options.unifyNetworks) {
                  Object.values(session.sessionVariables)
                    .forEach((sessionVariables) => {
                      verifySessionVariables(sessionVariables);
                    });
                } else {
                  verifySessionVariables(session.sessionVariables);
                }
              } catch (e) {
                failedExports.push(e);
                return;
              }

              const protocol = protocols[protocolUID];
              const prefix = getFilePrefix(
                session,
                protocol,
                options.unifyNetworks,
              );

              // Returns promise resolving to filePath for each format exported
              exportFormats.forEach((exportFormat) => {
                // Partitioning the network based on node and edge type so we can create
                // an individual export file for each type
                const partitionedNetworks = partitionNetworkByType(
                  protocol.codebook,
                  session,
                  exportFormat,
                );

                partitionedNetworks.forEach((partitionedNetwork) => {
                  const partitionedEntity = partitionedNetwork.partitionEntity;
                  promisedExports.push(() => new Promise((resolve, reject) => {
                    try {
                      exportFile(
                        prefix,
                        partitionedEntity,
                        exportFormat,
                        tempDirectoryPath,
                        partitionedNetwork,
                        protocol.codebook,
                        this.fsInterface,
                        options,
                      ).then((result) => {
                        if (!finishedSessions.includes(prefix)) {
                          // If we unified the networks, we need to iterate sessionVariables and
                          // emit a 'session-exported' event for each sessionID
                          if (options.unifyNetworks) {
                            Object.values(session.sessionVariables)
                              .forEach((sessionVariables) => {
                                this.emit('session-exported', sessionVariables.sessionId);
                              });
                          } else {
                            this.emit('session-exported', session.sessionVariables.sessionId);
                          }

                          this.emit('update', ProgressMessages.ExportSession(finishedSessions.length + 1, sessionExportTotal));
                          finishedSessions.push(prefix);
                        }
                        resolve(result);
                      }).catch((e) => reject(e));
                    } catch (error) {
                      this.emit('error', `Encoding ${prefix} failed: ${error.message}`);
                      this.emit('update', ProgressMessages.ExportSession(finishedSessions.length + 1, sessionExportTotal));
                      reject(error);
                    }
                  }));
                });
              });
            });
          });

          q.push(promisedExports, (err, result) => {
            if (err) {
              failedExports.push(err);
              return;
            }
            completedExports.push(result);
          });

          return new Promise((resolve, reject) => {
            q.drain().then(resolve).catch(reject);
          });
        })
        // Then, return the paths to the exported files
        .then(() => {
          if (!shouldContinue()) {
            throw new UserCancelledExport();
          }

          // FatalError if there are no sessions to encode and only errors
          if (completedExports.length === 0 && failedExports.length > 0) {
            throw new ExportError(ErrorMessages.NothingToExport);
          }

          // If we have no files to encode (but we do have errors), finish
          // the task here so the user can see the errors
          if (completedExports.length === 0) {
            this.emit('finished', ProgressMessages.Finished);
            cleanUp();
            resolveRun();
            cancelled = true;
            return Promise.resolve();
          }

          cleanUp();
          return resolveRun({ completedExports, failedExports });
        })
        .catch((err) => {
          cleanUp();
          // We don't reject if this is an error from user cancelling
          if (!(err instanceof UserCancelledExport)) {
            this.emit('cancelled', ProgressMessages.Cancelled);
            rejectRun(err);
          }
        });
    }); // End run()

    const abort = () => {
      // eslint-disable-next-line no-console
      console.info('Aborting file export.');
      if (!shouldContinue()) {
        // eslint-disable-next-line no-console
        console.warn('This export already aborted. Cancelling abort!');
        return;
      }
      cancelled = true;
    };

    return { run, abort };
  }
}

module.exports = FileExportManager;
