/* eslint-env jest */
const { ExportError, ErrorMessages } = require('../../consts/errors/ExportError');
const {
  verifySessionVariables,
  getFileExtensionForType,
  getFileExportListFromFormats,
  makeFormats,
} = require('../general');

describe('verifySessionVariables', () => {
  it('throws an error if the session variables are missing', () => {
    const session = {};
    expect(
      () => verifySessionVariables(session),
    ).toThrow(new ExportError(ErrorMessages.MissingParameters));
  });
});

describe('getFileExtensionForType', () => {
  it('maps CSV types', () => {
    expect(getFileExtensionForType('adjacencyMatrix')).toEqual('.csv');
    expect(getFileExtensionForType('edgeList')).toEqual('.csv');
    expect(getFileExtensionForType('attributeList')).toEqual('.csv');
    expect(getFileExtensionForType('ego')).toEqual('.csv');
  });
});

describe('makeFormats', () => {
  it('expands an array to include default options', () => {
    expect(makeFormats(['graphml'])).toEqual({
      graphml: {
        directedEdges: false,
      },
    });

    expect(makeFormats(['csv'])).toEqual({
      csv: {
        directedEdges: false,
        includeAdjacencyMatrix: false,
        includeAttributeList: true,
        includeEdgeList: true,
      },
    });

    expect(makeFormats(['csv', 'graphml'])).toEqual({
      csv: {
        directedEdges: false,
        includeAdjacencyMatrix: false,
        includeAttributeList: true,
        includeEdgeList: true,
      },
      graphml: {
        directedEdges: false,
      },
    });
  });

  it('extends a configuration object to include defaults', () => {
    expect(makeFormats({ graphml: { directedEdges: true } })).toEqual({
      graphml: {
        directedEdges: true,
      },
    });

    expect(makeFormats({
      csv: {
        includeAdjacencyMatrix: true,
      },
    })).toEqual({
      csv: {
        directedEdges: false,
        includeAdjacencyMatrix: true,
        includeAttributeList: true,
        includeEdgeList: true,
      },
    });
  });

  it('throws an error when an unsupported format is referenced', () => {
    expect(
      () => makeFormats(['unsupported']),
    ).toThrow(new ExportError(ErrorMessages.InvalidFormat));

    expect(
      () => makeFormats({ unsupported: {} }),
    ).toThrow(new ExportError(ErrorMessages.InvalidFormat));
  });

  it('emits a warning when an invalid option type is provided for a format, and ignores it', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Directed edges should be type boolean
    expect(makeFormats({ graphml: { directedEdges: 'invalid' } })).toEqual({
      graphml: {
        directedEdges: false,
      },
    });

    expect(spy).toHaveBeenCalled();
  });

  it('emits a warning when an invalid option is provided for a format', () => {
    const spy = jest.spyOn(console, 'warn');
    makeFormats({
      csv: {
        invalid: 'invalid',
      },
    });
    expect(spy).toHaveBeenCalled();
  });

  it('throw an error when no formats are provided', () => {
    expect(
      () => makeFormats(),
    ).toThrow(new ExportError(ErrorMessages.MissingParameters));
  });
});

describe('getFileExportListFromFormats', () => {
  it('returns empty array when no formats are provided', () => {
    expect(getFileExportListFromFormats([])).toEqual([]);
  });

  it('handles missing formats parameter by returning empty array', () => {
    expect(getFileExportListFromFormats()).toEqual([]);
  });
});
