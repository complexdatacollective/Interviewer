const sanitizeFilename = require('sanitize-filename');
const { isEmpty, has, get } = require('lodash');
const {
  caseProperty,
  sessionProperty,
  protocolProperty,
  entityAttributesProperty,
  sessionExportTimeProperty,
  codebookHashProperty,
} = require('@codaco/shared-consts');
const { ExportError, ErrorMessages } = require('../consts/errors/ExportError');
const { DEFAULT_EXPORT_OPTIONS, SUPPORTED_FORMATS } = require('../consts/export-consts');

// Session vars should match https://github.com/codaco/graphml-schemas/blob/master/xmlns/1.0/graphml%2Bnetcanvas.xsd
const verifySessionVariables = (sessionVariables) => {
  if (
    !sessionVariables[caseProperty]
    || !sessionVariables[sessionProperty]
    || !sessionVariables[protocolProperty]
    || !sessionVariables[sessionExportTimeProperty]
    || !sessionVariables[codebookHashProperty]
  ) {
    throw new ExportError(ErrorMessages.MissingParameters);
  }

  return true;
};

function getEntityAttributes(entity) {
  if (!entity) {
    throw new Error('Entity is required');
  }

  return get(entity, entityAttributesProperty, {});
}

const makeFilename = (prefix, entityType, exportFormat, extension) => {
  const escapeFilePart = (part) => part.replace(/\W/g, '');

  let name = prefix;
  if (extension !== `.${exportFormat}`) {
    name += name ? '_' : '';
    name += exportFormat;
  }
  if (entityType) {
    name += `_${escapeFilePart(entityType)}`;
  }
  return `${name}${extension}`;
};

/**
 * Provide the appropriate file extension for the export type
 * @param  {string} formatterType one of the `format`s
 * @return {string}
 */
const getFileExtensionForType = (formatterType) => {
  switch (formatterType) {
    case 'graphml':
      return SUPPORTED_FORMATS.graphml.extension;
    case 'adjacencyMatrix':
    case 'edgeList':
    case 'attributeList':
    case 'ego':
      return SUPPORTED_FORMATS.csv.extension;
    default:
      return null;
  }
};

// Determine filename prefix based on if we are exporting a single session
// or a unified network
const getFilePrefix = (session, protocol, unifyNetworks) => {
  if (unifyNetworks) {
    return sanitizeFilename(protocol.name);
  }

  const caseAsString = session.sessionVariables[caseProperty].toString();

  return `${sanitizeFilename(caseAsString)}_${session.sessionVariables[sessionProperty]}`;
};

const concatTypedArrays = (a, b) => {
  const combined = new Uint8Array(a.byteLength + b.byteLength);
  combined.set(a);
  combined.set(b, a.length);
  return combined;
};

const getFileExportListFromFormats = (
  formats,
) => {
  if (!formats || isEmpty(formats)) {
    return [];
  }

  const formatNames = Object.keys(formats);
  // Throw an error if any format isn't supported
  const supportedFormats = Object.keys(SUPPORTED_FORMATS);
  formatNames.every((format) => supportedFormats.includes(format));

  const fileExportList = [];

  if (formatNames.includes('graphml')) {
    fileExportList.push('graphml');
  }

  if (formatNames.includes('csv')) {
    fileExportList.push('ego');

    if (formats.csv.includeAdjacencyMatrix) {
      fileExportList.push('adjacencyMatrix');
    }
    if (formats.csv.includeEdgeList) {
      fileExportList.push('edgeList');
    }
    if (formats.csv.includeAttributeList) {
      fileExportList.push('attributeList');
    }
  }

  return fileExportList;
};

const validateUserOptionType = (optionName, optionValue) => {
  const optionType = typeof DEFAULT_EXPORT_OPTIONS[optionName];
  // eslint-disable-next-line valid-typeof
  if (optionType !== typeof optionValue) {
    return false;
  }

  return true;
};

// Merge default and user-supplied options
const makeOptions = (userOptions) => {
  const userOptionsKeys = Object.keys(userOptions);
  const defaultOptions = Object.keys(DEFAULT_EXPORT_OPTIONS);

  return defaultOptions.reduce((acc, optionName) => {
    if (userOptionsKeys.includes(optionName)) {
      if (!validateUserOptionType(optionName, userOptions[optionName])) {
        // eslint-disable-next-line no-console
        console.warn(`Option ${optionName} is not the correct type. Ignoring.`);
        return {
          ...acc,
          [optionName]: DEFAULT_EXPORT_OPTIONS[optionName],
        };
      }

      return {
        ...acc,
        [optionName]: userOptions[optionName],
      };
    }

    return {
      ...acc,
      [optionName]: DEFAULT_EXPORT_OPTIONS[optionName],
    };
  }, {});
};

const validateUserFormatOptionType = (format, optionName, optionValue) => {
  const optionType = typeof SUPPORTED_FORMATS[format].options[optionName];

  // eslint-disable-next-line valid-typeof
  if (optionType !== typeof optionValue) {
    return false;
  }

  return true;
};

const makeFormats = (userFormats) => {
  // User can provide an array of formats, which will use the default
  // options.
  if (Array.isArray(userFormats)) {
    return userFormats.reduce((acc, format) => {
      if (!Object.keys(SUPPORTED_FORMATS).includes(format)) {
        throw new ExportError(ErrorMessages.InvalidFormat, format);
      }

      return {
        ...acc,
        [format]: Object.keys(SUPPORTED_FORMATS[format].options).reduce((acc2, option) => ({
          ...acc2,
          [option]: SUPPORTED_FORMATS[format].options[option],
        }), {}),
      };
    }, {});
  }

  // User can provide an object, with options specified for each format.
  // In this case merge the user-supplied options with the default options.
  if (typeof userFormats === 'object') {
    return Object.keys(userFormats).reduce((acc, format) => {
      // Check if the format is supported
      if (!Object.keys(SUPPORTED_FORMATS).includes(format)) {
        throw new ExportError(ErrorMessages.InvalidFormat, format);
      }

      const userFormatOptions = userFormats[format];
      const defaultFormatOptions = SUPPORTED_FORMATS[format].options;

      const options = Object.keys(defaultFormatOptions).reduce((acc2, option) => {
        if (has(userFormatOptions, option)) {
          if (!validateUserFormatOptionType(format, option, userFormatOptions[option])) {
            // eslint-disable-next-line no-console
            console.warn(`${option} is not a valid option for ${format}. Ignoring.`);
            return {
              ...acc2,
              [option]: defaultFormatOptions[option],
            };
          }

          return {
            ...acc2,
            [option]: userFormatOptions[option],
          };
        }

        return {
          ...acc2,
          [option]: defaultFormatOptions[option],
        };
      }, {});

      return {
        ...acc,
        [format]: options,
      };
    }, {});
  }

  throw new ExportError(ErrorMessages.MissingParameters);
};

module.exports = {
  makeFormats,
  makeOptions,
  getFileExportListFromFormats,
  concatTypedArrays,
  getEntityAttributes,
  getFileExtensionForType,
  getFilePrefix,
  makeFilename,
  verifySessionVariables,
};
