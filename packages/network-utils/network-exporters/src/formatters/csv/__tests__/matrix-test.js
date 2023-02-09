/* eslint-env jest */
const { ncSourceUUID, ncTargetUUID } = require('@codaco/shared-consts');
const { makeWriteableStream } = require('../../../../config/setupTestEnv');
const { AdjacencyMatrixFormatter, asAdjacencyMatrix } = require('../matrix');

const mockNetwork = (edges) => ({
  edges,
  nodes: Object.values(edges.reduce((acc, val) => {
    acc[val[ncSourceUUID]] = ({ _uid: val[ncSourceUUID] });
    acc[val[ncTargetUUID]] = ({ _uid: val[ncTargetUUID] });
    return acc;
  }, {})),
});

const mockMatrix = (edges, directed) => asAdjacencyMatrix(mockNetwork(edges), directed);

describe('asAdjacencyMatrix', () => {
  it('represents an edgeless network', () => {
    const network = { nodes: [{ _uid: 1 }, { _uid: 2 }], edges: [] };
    expect(asAdjacencyMatrix(network).toArray()).toEqual([0, 0, 0, 0]);
  });

  it('is resilient to duplicate UIDs', () => {
    const network = { nodes: [{ _uid: 1 }, { _uid: 2 }, { _uid: 1 }], edges: [] };
    expect(asAdjacencyMatrix(network).toArray()).toEqual([0, 0, 0, 0]);
  });

  it('represents a single undirected edge', () => {
    expect(mockMatrix([{ [ncSourceUUID]: 1, [ncTargetUUID]: 2 }]).toArray()).toEqual([
      0, 1,
      1, 0,
    ]);
  });

  it('represents a single directed edge', () => {
    expect(mockMatrix([{ [ncSourceUUID]: 1, [ncTargetUUID]: 2 }], true).toArray()).toEqual([
      0, 1,
      0, 0,
    ]);
  });

  it('only represents presence (not counts)', () => {
    expect(mockMatrix([
      { [ncSourceUUID]: 1, [ncTargetUUID]: 2 }, { [ncSourceUUID]: 1, [ncTargetUUID]: 2 },
    ]).toArray()).toEqual([
      0, 1,
      1, 0,
    ]);
  });

  it('represents a sparse matrix', () => {
    const network = {
      nodes: [{ _uid: 1 }, { _uid: 2 }, { _uid: 3 }, { _uid: 4 }],
      edges: [{ [ncSourceUUID]: 2, [ncTargetUUID]: 4 }],
    };
    expect(asAdjacencyMatrix(network).toArray()).toEqual([
      0, 0, 0, 0,
      0, 0, 0, 1,
      0, 0, 0, 0,
      0, 1, 0, 0,
    ]);
  });

  it('represents a sparse directed matrix', () => {
    const network = {
      nodes: [{ _uid: 1 }, { _uid: 2 }, { _uid: 3 }, { _uid: 4 }],
      edges: [{ [ncSourceUUID]: 2, [ncTargetUUID]: 4 }],
    };
    expect(asAdjacencyMatrix(network, true).toArray()).toEqual([
      0, 0, 0, 0,
      0, 0, 0, 1,
      0, 0, 0, 0,
      0, 0, 0, 0,
    ]);
  });
});

describe('toCSVStream', () => {
  let writable;

  beforeEach(() => {
    writable = makeWriteableStream();
  });

  it('Writes a simple csv', async () => {
    const matrix = mockMatrix([{ [ncSourceUUID]: 1, [ncTargetUUID]: 2 }]);
    matrix.toCSVStream(writable);
    const csv = await writable.asString();
    expect(csv).toEqual(',1,2\r\n1,0,1\r\n2,1,0\r\n');
  });

  it('Handles duplicate edges', async () => {
    const matrix = mockMatrix([
      { [ncSourceUUID]: 1, [ncTargetUUID]: 2 }, { [ncSourceUUID]: 1, [ncTargetUUID]: 2 },
    ]);
    matrix.toCSVStream(writable);
    const csv = await writable.asString();
    expect(csv).toEqual(',1,2\r\n1,0,1\r\n2,1,0\r\n');
  });

  it('Writes a csv with > 8 cells', async () => {
    const matrix = mockMatrix([
      { [ncSourceUUID]: 1, [ncTargetUUID]: 2 },
      { [ncSourceUUID]: 3, [ncTargetUUID]: 4 },
      { [ncSourceUUID]: 5, [ncTargetUUID]: 6 },
      { [ncSourceUUID]: 7, [ncTargetUUID]: 8 },
      { [ncSourceUUID]: 9, [ncTargetUUID]: 10 },
    ]);
    matrix.toCSVStream(writable);
    const csv = await writable.asString();
    const rows = [
      ',1,2,3,4,5,6,7,8,9,10',
      '1,0,1,0,0,0,0,0,0,0,0',
      '2,1,0,0,0,0,0,0,0,0,0',
      '3,0,0,0,1,0,0,0,0,0,0',
      '4,0,0,1,0,0,0,0,0,0,0',
      '5,0,0,0,0,0,1,0,0,0,0',
      '6,0,0,0,0,1,0,0,0,0,0',
      '7,0,0,0,0,0,0,0,1,0,0',
      '8,0,0,0,0,0,0,1,0,0,0',
      '9,0,0,0,0,0,0,0,0,0,1',
      '10,0,0,0,0,0,0,0,0,1,0\r\n',
    ];
    expect(csv).toEqual(rows.join('\r\n'));
  });
});

describe('AdjacencyMatrixFormatter', () => {
  let writable;

  beforeEach(() => {
    writable = makeWriteableStream();
  });

  it('writeToStream returns an abort controller', () => {
    const formatter = new AdjacencyMatrixFormatter({}, {}, { globalOptions: {} });
    const controller = formatter.writeToStream(writable);
    expect(controller.abort).toBeInstanceOf(Function);
  });
});
