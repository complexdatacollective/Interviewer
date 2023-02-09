/* eslint-disable no-bitwise,max-classes-per-file */
/* eslint space-infix-ops: ["error", {"int32Hint": true}] */
const { Readable } = require('stream');
const { entityPrimaryKeyProperty, ncSourceUUID, ncTargetUUID } = require('@codaco/shared-consts');
const { csvEOL } = require('./csv');

/**
 * An opaque reprensentation of an adjacency matrix with binary values (edge is present/absent).
 *
 * "from": read down column to row
 * "to": read across row to column
 *
 * Currently, the only interface for output is streaming to CSV. (Array and string representations
 * are provided for testing small matrices.)
 *
 * Internally, the matrix is structured as a 1-d array buffer of 8-bit unsigned integers, with each
 * bit representing a cell. Cells in a matrix row are reprensented (logically) by consecutive bits;
 * a subsequent row is logically accessed with a stride equal to the node count. This representation
 * allows for faster output, but (memory issues aside) places a hard limit on the size of the
 * network of about 185k nodes.
 *
 * Conceptually, in a 2d array, access would be m[to][from]; in a 1-d, it's m[dimension * from + to]
 *
 * This has been tested with a network from db-size.js, using UUIDs as labels and representing the
 * largest network we're likely to encounter in practice (81k nodes, 810k edges -> ~13GB csv).
 *
 * Usage:
 * 1. initialize the matrix with a NC network
 * 2. call calculateEdges() to generate the data
 * 3. export to CSV using toCSVStream()
 *
 * Notes:
 * - literal power-of-two division & modulo appear to be automatically optimized for us;
 * there's no benefit using bitwise (observed: `~~(i / 8)` may even be faster than `i >>> 3`).
 * - `~~` used for flooring where appropriate; `|0` is reserved as int32 hint
 *
 * @example
 * Example CSV output:
 * ```
 * ,a,b,c
 * a,0,1,0
 * b,1,0,0
 * c,0,0,0
 * ```
 *
 * @param {object} network A network object in NC format: ({ nodes, edges }).
 *                         This must not be mutated externally between initialization and
 *                         edge calculation.
 */
// TODO: if ego modeled separately, need to include in nodes
// TODO: Take a guess at heap use based on network size and throw if exceeded?
class AdjacencyMatrix {
  constructor(network) {
    // TODO: Store a quote-escaped version?
    // Track only unique IDs (duplicates are discarded). The ordering here provides the ordering for
    // both header and data output.
    const nodes = network.nodes || [];
    const uniqueNodeIds = [...new Set(nodes.map((node) => node[entityPrimaryKeyProperty]))];
    this.uniqueNodeIds = uniqueNodeIds;

    const dimension = uniqueNodeIds.length;
    this.dimension = dimension;

    // Total number of bits needed for a bitwise matrix

    // By using a buffer + typedArray, we avoid the need to fill
    // (which is inefficient on very large arrays)
    const bitLength = Math.ceil((dimension * dimension) / 8);
    this.buffer = new ArrayBuffer(bitLength);

    // A persisted view into the buffer to make the initial construction faster
    this.arrayView = new Uint8Array(this.buffer);

    // Keep a reference to network; this should be immutable (read-only)
    this.network = network;
  }

  /**
   * This 'turns on' the cell representing this edge.
   *
   * @param {string} from a UID
   * @param {string} to   a UID
   * @throws {ReferenceError} if this is called before calculateEdges()
   */
  setAdjacent(from, to) {
    const fromIndex = this.indexMap[from];
    const toIndex = this.indexMap[to];
    const elementIndex = (this.dimension * fromIndex) + toIndex;
    const byteIndex = ~~(elementIndex / 8);
    const bitIndex = elementIndex % 8;
    const adjacencyBitmask = 1 << (7 - bitIndex); // cells are ordered left->right
    // eslint-disable-next-line operator-assignment
    this.arrayView[byteIndex] = this.arrayView[byteIndex] | adjacencyBitmask;
  }

  /**
   * @param  {Boolean} directed true if edges are directed; default is false.
   */
  calculateEdges(directed = false) {
    // Allow fast lookup of index for each node
    this.indexMap = this.uniqueNodeIds.reduce((acc, uid, index) => {
      acc[uid] = index;
      return acc;
    }, {});

    (this.network.edges || []).forEach((edge) => {
      this.setAdjacent(edge[ncSourceUUID], edge[ncTargetUUID]);
      if (directed === false) {
        this.setAdjacent(edge[ncTargetUUID], edge[ncSourceUUID]);
      }
    });
  }

  /**
   * @param {Stream.Writable} outStream A writable stream for CSV output
   * @return {Object} an abort controller; call the attached abort() method as needed.
   */
  toCSVStream(outStream) {
    const { uniqueNodeIds } = this;
    const dataColumnCount = uniqueNodeIds.length;
    const matrixCellCount = dataColumnCount * dataColumnCount;

    // The *logical* index into the matrix (1-d bit array reprensentation);
    // cannot be used directly to index into arrayViews.
    let matrixIndex = 0;

    const decimals = uniqueNodeIds.map((id) => id);
    const headerRowContent = `,${decimals.join(',')}${csvEOL}`;

    // TODO: escape headerLabels (if not already) & quote
    const dataRowContent = (headerLabel, matrix) => {
      const rowBuffer = new ArrayBuffer(dataColumnCount);
      const cols = new Uint8Array(rowBuffer);

      // Indexing logic is similar to calculateEdges(), but by maintaining
      // separate byte & bit counters, we speed up row construction somewhat.
      const initialByteIndex = ~~(matrixIndex / 8);
      const initialBitIndex = matrixIndex % 8;
      let byteIndex = initialByteIndex;
      let bitIndex = initialBitIndex;
      let byte = matrix[byteIndex];
      let bitmask;

      for (let i = 0; i < dataColumnCount; i += 1) {
        bitmask = 1 << (7 - bitIndex); // cells are ordered left->right
        // zero-compare is slower if it has to convert Number, the 0|0 literal is a hint for int32.
        // Storing 0|0 in variable or surrounding in parens loses this hint in node 8.x
        // (though not 10.x; TODO: revisit after version bump.)
        cols[i] = (byte & bitmask) !== 0 | 0;

        matrixIndex += 1;

        if (matrixIndex > matrixCellCount) {
          break;
        }

        bitIndex = (bitIndex + 1) % 8;
        if (bitIndex === 0 | 0) {
          byteIndex += 1;
          byte = matrix[byteIndex];
        }
      }

      // Observed: native join here is >50% of execution time, but this approach
      // still beats repeated streaming calls (even with manual buffering)
      return `${headerLabel},${cols.join(',')}${csvEOL}`;
    };

    // Chrome stores 'small integers' (31 bits; extra bit used as a flag).
    // See 'zero-compare' comments in rowContent(); once the matrix index exceeds what can be
    // stored in an integer internally, we see a 3-4x performance penalty.
    // When we see that happen, we'll truncate the view into the buffer to keep the index small.
    const v8MaxInt = ((2 ** 31) - 1) | 0;
    let truncatingView = this.arrayView.subarray();
    let row;

    let headerWritten = false;
    let rowNum = 0;

    const inStream = new Readable({
      read(/* size */) {
        if (!headerWritten) {
          this.push(headerRowContent);
          headerWritten = true;
        } else if (rowNum < dataColumnCount) {
          row = dataRowContent(uniqueNodeIds[rowNum], truncatingView);
          this.push(row);
          rowNum += 1;

          // TODO: how to test? inject/mock max?
          if (matrixIndex > v8MaxInt) {
            // 'Reset' our view of the matrix to keep the index small
            // by truncating our data view of the underlying buffer.
            const leftoverBits = matrixIndex % 8;
            truncatingView = truncatingView.subarray(~~(matrixIndex / 8));
            matrixIndex = leftoverBits;
          }
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
  }

  toArray(matrixView = this.arrayView) {
    if (this.dimension > 100) {
      // This is only useful for debugging/testing
      // eslint-disable-next-line no-console
      console.warn('toArray() not supported on large matrices');
      return [];
    }

    return this.toString(matrixView).split('').map(Number);
  }

  toString(matrixView = this.arrayView) {
    if (this.dimension > 100) {
      // This is only useful for debugging/testing
      // eslint-disable-next-line no-console
      console.warn('toString() not supported on large matrices');
      return '';
    }
    const str = Array.from(matrixView).reduce((acc, val) => {
      acc = `${acc}${val.toString(2).padStart(8, '0')}`; // eslint-disable-line no-param-reassign
      return acc;
    }, '');
    return str.substr(0, this.dimension * this.dimension);
  }
}

const asAdjacencyMatrix = (network, directed = false) => {
  const adjacencyMatrix = new AdjacencyMatrix(network);
  adjacencyMatrix.calculateEdges(directed);
  return adjacencyMatrix;
};

class AdjacencyMatrixFormatter {
  constructor(data, codebook, { globalOptions: { useDirectedEdges } }) {
    this.matrix = asAdjacencyMatrix(data, useDirectedEdges);
  }

  writeToStream(outStream) {
    return this.matrix.toCSVStream(outStream);
  }
}

module.exports = {
  AdjacencyMatrixFormatter,
  asAdjacencyMatrix,
};
