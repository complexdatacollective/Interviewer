const { Readable } = require('stream');
const {
  entityAttributesProperty,
  entityPrimaryKeyProperty,
  caseProperty,
  egoProperty,
  sessionProperty,
  protocolName,
  sessionStartTimeProperty,
  sessionFinishTimeProperty,
  sessionExportTimeProperty,
  ncCaseProperty,
  ncSessionProperty,
  ncProtocolNameProperty,
} = require('@codaco/shared-consts');
const { processEntityVariables } = require('../network');
const { sanitizedCellValue, csvEOL } = require('./csv');

const asEgoAndSessionVariablesList = (network, codebook, exportSettings) => {
  if (exportSettings.unifyNetworks) {
    // If unified networks is enabled, network.ego is an object keyed by sessionID.
    return Object.keys(network.ego).map((sessionID) => (
      processEntityVariables({
        ...network.ego[sessionID],
        ...network.sessionVariables[sessionID],
      }, 'ego', codebook, exportSettings)
    ));
  }

  return [processEntityVariables({
    ...network.ego,
    ...network.sessionVariables,
  }, 'ego', codebook, exportSettings)];
};

/**
 * The output of this formatter will contain the primary key (_uid)
 * and all model data (inside the `attributes` property)
 */
const attributeHeaders = (egos) => {
  const initialHeaderSet = new Set([]);

  // Create initial headers for non-attribute (model) variables such as sessionID
  initialHeaderSet.add(entityPrimaryKeyProperty);
  initialHeaderSet.add(caseProperty);
  initialHeaderSet.add(sessionProperty);
  initialHeaderSet.add(protocolName);
  initialHeaderSet.add(sessionStartTimeProperty);
  initialHeaderSet.add(sessionFinishTimeProperty);
  initialHeaderSet.add(sessionExportTimeProperty);

  const headerSet = egos.reduce((headers, ego) => {
    // Add headers for attributes
    Object.keys((ego && ego[entityAttributesProperty]) || {}).forEach((key) => {
      headers.add(key);
    });

    return headers;
  }, initialHeaderSet);
  return [...headerSet];
};

const getPrintableAttribute = (attribute) => {
  switch (attribute) {
    case caseProperty:
      return ncCaseProperty;
    case sessionProperty:
      return ncSessionProperty;
    case protocolName:
      return ncProtocolNameProperty;
    case entityPrimaryKeyProperty:
      return egoProperty;
    default:
      return attribute;
  }
};

/**
 * @return {Object} an abort controller; call the attached abort() method as needed.
 */
const toCSVStream = (egos, outStream) => {
  const totalRows = egos.length;
  const attrNames = attributeHeaders(egos);
  let headerWritten = false;
  let rowIndex = 0;
  let rowContent;
  let ego;

  const inStream = new Readable({
    read(/* size */) {
      if (!headerWritten) {
        this.push(`${attrNames.map((attr) => sanitizedCellValue(getPrintableAttribute(attr))).join(',')}${csvEOL}`);
        headerWritten = true;
      } else if (rowIndex < totalRows) {
        ego = egos[rowIndex] || {};
        const values = attrNames.map((attrName) => {
          // Session variables exist at the top level - all others inside `attributes`
          let value;
          if (
            attrName === entityPrimaryKeyProperty
            || attrName === caseProperty
            || attrName === sessionProperty
            || attrName === protocolName
            || attrName === sessionStartTimeProperty
            || attrName === sessionFinishTimeProperty
            || attrName === sessionExportTimeProperty
          ) {
            value = ego[attrName];
          } else {
            value = ego[entityAttributesProperty][attrName];
          }
          return sanitizedCellValue(value);
        });
        rowContent = `${values.join(',')}${csvEOL}`;
        this.push(rowContent);
        rowIndex += 1;
      } else {
        this.push(null);
      }
    },
  });

  // TODO: handle teardown. Use pipeline() API in Node 10?
  inStream.pipe(outStream);

  return {
    abort: () => { inStream.destroy(); },
  };
};

class EgoListFormatter {
  constructor(network, codebook, exportSettings) {
    this.list = asEgoAndSessionVariablesList(network, codebook, exportSettings) || [];
  }

  writeToStream(outStream) {
    return toCSVStream(this.list, outStream);
  }
}

module.exports = {
  EgoListFormatter,
  asEgoAndSessionVariablesList,
  toCSVStream,
};
