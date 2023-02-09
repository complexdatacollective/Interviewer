const SUPPORTED_FORMATS = {
  graphml: {
    description: 'Network Canvas GraphML',
    extension: '.graphml',
    options: {
      directedEdges: false,
    },
  },
  csv: {
    description: 'Comma-separated values',
    extension: '.csv',
    options: {
      directedEdges: false,
      includeAdjacencyMatrix: false,
      includeAttributeList: true,
      includeEdgeList: true,
    },
  },
};

const DEFAULT_EXPORT_OPTIONS = {
  tempDataPath: '/temp',
  queueConcurrency: 5,
  unifyNetworks: false,
  useScreenLayoutCoordinates: true,
  screenLayoutWidth: 1920,
  screenLayoutHeight: 1080,
};

module.exports = {
  SUPPORTED_FORMATS,
  DEFAULT_EXPORT_OPTIONS,
};
