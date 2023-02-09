const { Readable } = require('stream');
const {
  entityAttributesProperty,
  egoProperty,
  entityPrimaryKeyProperty,
  nodeExportIDProperty,
  ncUUIDProperty,
} = require('@codaco/shared-consts');
const { processEntityVariables } = require('../network');
const { sanitizedCellValue, csvEOL } = require('./csv');

const asAttributeList = (network, codebook, exportOptions) => {
  const processedNodes = (network.nodes || []).map((node) => {
    if (codebook && codebook.node[node.type]) {
      return processEntityVariables(node, 'node', codebook, exportOptions);
    }
    return node;
  });
  return processedNodes;
};

/**
 * The output of this formatter will contain the primary key (_uid)
 * and all model data (inside the `attributes` property)
 */
const attributeHeaders = (nodes) => {
  const initialHeaderSet = new Set([]);
  initialHeaderSet.add(nodeExportIDProperty);
  initialHeaderSet.add(egoProperty);
  initialHeaderSet.add(entityPrimaryKeyProperty);

  const headerSet = nodes.reduce((headers, node) => {
    Object.keys(node[entityAttributesProperty]).forEach((key) => {
      headers.add(key);
    });
    return headers;
  }, initialHeaderSet);
  return [...headerSet];
};

const getPrintableAttribute = (attribute) => {
  switch (attribute) {
    case entityPrimaryKeyProperty:
      return ncUUIDProperty;
    default:
      return attribute;
  }
};

/**
 * @return {Object} an abort controller; call the attached abort() method as needed.
 */
const toCSVStream = (nodes, outStream) => {
  const totalRows = nodes.length;
  const attrNames = attributeHeaders(nodes);
  let headerWritten = false;
  let rowIndex = 0;
  let rowContent;
  let node;

  const inStream = new Readable({
    read(/* size */) {
      if (!headerWritten) {
        this.push(`${attrNames.map((attr) => sanitizedCellValue(getPrintableAttribute(attr))).join(',')}${csvEOL}`);
        headerWritten = true;
      } else if (rowIndex < totalRows) {
        node = nodes[rowIndex];
        const values = attrNames.map((attrName) => {
          // The primary key and ego id exist at the top-level; all others inside `.attributes`
          let value;
          if (
            attrName === entityPrimaryKeyProperty
            || attrName === egoProperty
            || attrName === nodeExportIDProperty
          ) {
            value = node[attrName];
          } else {
            value = node[entityAttributesProperty][attrName];
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

class AttributeListFormatter {
  constructor(data, codebook, exportOptions) {
    this.list = asAttributeList(data, codebook, exportOptions);
  }

  writeToStream(outStream) {
    return toCSVStream(this.list, outStream);
  }
}

module.exports = {
  AttributeListFormatter,
  asAttributeList,
  toCSVStream,
};
