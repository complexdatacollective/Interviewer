/* eslint-env jest */

const {
  entityPrimaryKeyProperty,
  entityAttributesProperty,
  egoProperty,
  nodeExportIDProperty,
  ncUUIDProperty,
} = require('@codaco/shared-consts');
const { makeWriteableStream } = require('../../../../config/setupTestEnv');
const { DEFAULT_EXPORT_OPTIONS } = require('../../../consts/export-consts');
const { mockCodebook } = require('../../network');
const { AttributeListFormatter, asAttributeList, toCSVStream } = require('../attribute-list');

const node = {
  [egoProperty]: 123,
  [entityPrimaryKeyProperty]: 1,
  [entityAttributesProperty]: {
    name: 'Jane',
  },
};

const baseCSVAttributes = [
  nodeExportIDProperty,
  egoProperty,
  ncUUIDProperty,
];

describe('asAttributeList', () => {
  it('transforms a network to nodes', () => {
    const network = { nodes: [{ id: 1 }], edges: [] };
    expect(asAttributeList(network)).toEqual(network.nodes);
  });
});

describe('toCSVStream', () => {
  let writable;
  let testNode;

  beforeEach(() => {
    writable = makeWriteableStream();
    testNode = node;
  });

  it('writes a simple CSV', async () => {
    toCSVStream([testNode], writable);

    const csv = await writable.asString();

    const result = [
      ...baseCSVAttributes,
      'name\r\n',
      123,
      1,
      'Jane\r\n',
    ].join(',');
    expect(csv).toEqual(result);
  });

  it('escapes quotes', async () => {
    toCSVStream([
      {
        ...testNode,
        [entityAttributesProperty]: {
          name: '"Nicky"',
        },
      },
    ], writable);

    const csv = await writable.asString();

    const result = [
      ...baseCSVAttributes,
      'name\r\n',
      123,
      1,
      '"""Nicky"""\r\n',
    ].join(',');
    expect(csv).toEqual(result);
  });

  it('escapes quotes in attr names', async () => {
    toCSVStream([
      {
        ...testNode,
        [entityAttributesProperty]: {
          '"quoted"': 1,
        },
      },
    ], writable);

    const csv = await writable.asString();

    const result = [
      ...baseCSVAttributes,
      '"""quoted"""\r\n',
      123,
      1,
      '1\r\n',
    ].join(',');
    expect(csv).toEqual(result);
  });

  it('stringifies and quotes objects', async () => {
    toCSVStream([
      {
        ...testNode,
        [entityAttributesProperty]: {
          location: { x: 1, y: 1 },
        },
      },
    ], writable);
    const csv = await writable.asString();
    const result = [
      ...baseCSVAttributes,
      'location\r\n',
      123,
      1,
      '"{""x"":1,""y"":1}"\r\n',
    ].join(',');
    expect(csv).toEqual(result);
  });

  it('exports undefined values as blank', async () => {
    toCSVStream([
      {
        ...testNode,
        [entityAttributesProperty]: {
          prop: undefined,
        },
      },
    ], writable);

    const csv = await writable.asString();

    const result = [
      ...baseCSVAttributes,
      'prop\r\n',
      123,
      1,
      '\r\n',
    ].join(',');
    expect(csv).toEqual(result);
  });

  it('exports null values as blank', async () => {
    toCSVStream([
      {
        ...testNode,
        [entityAttributesProperty]: {
          prop: null,
        },
      },
    ], writable);

    const csv = await writable.asString();

    const result = [
      ...baseCSVAttributes,
      'prop\r\n',
      123,
      1,
      '\r\n',
    ].join(',');
    expect(csv).toEqual(result);
  });

  it('exports `false` values as "false"', async () => {
    toCSVStream([
      {
        ...testNode,
        [entityAttributesProperty]: {
          prop: false,
        },
      },
    ], writable);

    const csv = await writable.asString();

    const result = [
      ...baseCSVAttributes,
      'prop\r\n',
      123,
      1,
      'false\r\n',
    ].join(',');
    expect(csv).toEqual(result);
  });
});

describe('AttributeListFormatter', () => {
  let writable;

  beforeEach(() => {
    writable = makeWriteableStream();
  });

  it('writeToStream returns an abort controller', () => {
    const formatter = new AttributeListFormatter({}, mockCodebook, DEFAULT_EXPORT_OPTIONS);
    const controller = formatter.writeToStream(writable);
    expect(controller.abort).toBeInstanceOf(Function);
  });
});
