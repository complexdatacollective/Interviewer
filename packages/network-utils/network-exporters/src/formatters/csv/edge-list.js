const { Readable } = require('stream');
const {
  entityAttributesProperty,
  egoProperty,
  entityPrimaryKeyProperty,
  edgeExportIDProperty,
  ncSourceUUID,
  ncTargetUUID,
  ncUUIDProperty,
} = require('@codaco/shared-consts');
const { processEntityVariables } = require('../network');
const { sanitizedCellValue, csvEOL } = require('./csv');

/**
 * Builds an edge list for a network, based only on its edges (it need
 * not contain all nodes). Each row contains two nodes; nodes in each column may be duplicated.
 *
 * Note that duplicate edges (e.g., of different types) are not conveyed in the output.
 *
 * @example
 * ```
 * | from | to   |
 * | a    | b    |
 * | a    | c    |
 * | b    | a    |
 * | c    | a    |
 * ```
 *
 * @param  {Object} network NC network containing edges
 * @param  {Boolean} directed if false, adjacencies are represented in both directions
 *                            default: false
 * @return {Array} the edges list
 */
const asEdgeList = (network, codebook, exportSettings) => {
  const { useDirectedEdges } = exportSettings;

  const processedEdges = (network.edges || []).map((edge) => processEntityVariables(edge, 'edge', codebook, exportSettings));

  // This code block duplicated the edges when directed mode was off.
  // It has been disabled pending full directed mode support:
  // https://netcanvasteam.slack.com/archives/G1Q262J3Y/p1589465079036100
  if (useDirectedEdges === false) {
    // // this may change if we have support for directed vs undirected edges in NC
    // return (processedEdges || []).reduce((arr, edge) => (
    //   arr.concat(
    //     { ...edge, to: edge.to, from: edge.from },
    //     { ...edge, to: edge.from, from: edge.to },
    //   )
    // ), []);
  }
  return processedEdges;
};

/**
 * The output of this formatter will contain the primary key (_uid)
 * and all model data (inside the `attributes` property)
 */
const attributeHeaders = (edges) => {
  const initialHeaderSet = new Set([]);
  initialHeaderSet.add(edgeExportIDProperty);
  initialHeaderSet.add('from');
  initialHeaderSet.add('to');
  initialHeaderSet.add(egoProperty);
  initialHeaderSet.add(entityPrimaryKeyProperty);
  initialHeaderSet.add(ncSourceUUID);
  initialHeaderSet.add(ncTargetUUID);

  const headerSet = edges.reduce((headers, edge) => {
    Object.keys(edge[entityAttributesProperty] || []).forEach((key) => {
      headers.add(key);
    });
    return headers;
  }, initialHeaderSet);
  return [...headerSet];
};

const getPrintableAttribute = (attribute) => {
  switch (attribute) {
    case egoProperty:
      return egoProperty;
    case entityPrimaryKeyProperty:
      return ncUUIDProperty;
    default:
      return attribute;
  }
};

/**
 * Write a CSV reprensentation of the list to the given Writable stream.
 *
 * @example
 * ```
 * a,b
 * a,c
 * b,a
 * c,a
 * ```
 *
 * @return {Object} an abort controller; call the attached abort() method as needed.
 */
const toCSVStream = (edges, outStream) => {
  const totalChunks = edges.length;
  let chunkContent;
  let chunkIndex = 0;
  const attrNames = attributeHeaders(edges);
  let headerWritten = false;
  let edge;

  const inStream = new Readable({
    read(/* size */) {
      if (!headerWritten) {
        this.push(`${attrNames.map((attr) => sanitizedCellValue(getPrintableAttribute(attr))).join(',')}${csvEOL}`);
        headerWritten = true;
      } else if (chunkIndex < totalChunks) {
        edge = edges[chunkIndex];
        const values = attrNames.map((attrName) => {
          // primary key/ego id/to/from exist at the top-level; all others inside `.attributes`
          let value;
          if (
            attrName === entityPrimaryKeyProperty
            || attrName === edgeExportIDProperty
            || attrName === egoProperty
            || attrName === 'to'
            || attrName === 'from'
            || attrName === ncSourceUUID
            || attrName === ncTargetUUID
          ) {
            value = edge[attrName];
          } else {
            value = edge[entityAttributesProperty][attrName];
          }
          return sanitizedCellValue(value);
        });
        chunkContent = `${values.join(',')}${csvEOL}`;
        this.push(chunkContent);
        chunkIndex += 1;
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

class EdgeListFormatter {
  constructor(data, codebook, exportSettings) {
    this.list = asEdgeList(data, codebook, exportSettings);
  }

  writeToStream(outStream) {
    return toCSVStream(this.list, outStream);
  }
}

module.exports = {
  EdgeListFormatter,
  asEdgeList,
  toCSVStream,
};
