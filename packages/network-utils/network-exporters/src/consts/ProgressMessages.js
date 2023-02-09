const ProgressMessages = {
  Begin: {
    progress: 0,
    statusText: 'Starting export...',
  },
  Formatting: {
    progress: 10,
    statusText: 'Formatting network data...',
  },
  Merging: {
    progress: 20,
    statusText: 'Merging sessions by protocol...',
  },
  ExportSession: (sessionExportCount, sessionExportTotal) => ({
    progress: 30 + ((50 - 30) * (sessionExportCount / sessionExportTotal)),
    statusText: `Encoding session ${sessionExportCount} of ${sessionExportTotal}...`,
  }),
  Finished: {
    progress: 100,
    statusText: 'Export finished.',
  },
  Cancelled: {
    progress: 100,
    statusText: 'Export cancelled.',
  },
};

module.exports = ProgressMessages;
