/* eslint-env jest */
const {
  entityPrimaryKeyProperty,
  entityAttributesProperty,
  egoProperty,
  caseProperty,
  ncSessionProperty,
  ncProtocolNameProperty,
  sessionStartTimeProperty,
  sessionFinishTimeProperty,
  sessionExportTimeProperty,
  protocolName,
  ncCaseProperty,
  sessionProperty,
} = require('@codaco/shared-consts');
const { makeWriteableStream } = require('../../../../config/setupTestEnv');
const { EgoListFormatter, asEgoAndSessionVariablesList, toCSVStream } = require('../ego-list');
const { mockCodebook } = require('../../network');
const { DEFAULT_EXPORT_OPTIONS } = require('../../../consts/export-consts');

const ego = {
  [egoProperty]: 123,
  [caseProperty]: 'case id',
  [sessionProperty]: 789,
  [protocolName]: 'protocol name',
  [sessionStartTimeProperty]: 100,
  [sessionFinishTimeProperty]: 200,
  [sessionExportTimeProperty]: 300,
  [entityPrimaryKeyProperty]: 1,
  [entityAttributesProperty]: {
    name: 'Jane',
  },
};

const baseCSVAttributes = [
  egoProperty,
  ncCaseProperty,
  ncSessionProperty,
  ncProtocolNameProperty,
  sessionStartTimeProperty,
  sessionFinishTimeProperty,
  sessionExportTimeProperty,
];

describe('asEgoAndSessionVariablesList', () => {
  it('transforms a network to ego', () => {
    const network = { nodes: [], edges: [], ego: { id: 1, [entityAttributesProperty]: {} } };
    expect(asEgoAndSessionVariablesList(
      network,
      mockCodebook,
      DEFAULT_EXPORT_OPTIONS,
    )).toEqual([network.ego]);
  });
});

describe('toCSVStream', () => {
  let writable;
  let testEgo;

  beforeEach(() => {
    writable = makeWriteableStream();
    testEgo = ego;
  });

  it('writes a simple CSV', async () => {
    toCSVStream([testEgo], writable);

    const csv = await writable.asString();

    const result = [
      ...baseCSVAttributes,
      'name\r\n1',
      'case id',
      789,
      'protocol name',
      100,
      200,
      300,
      'Jane\r\n',
    ].join(',');
    expect(csv).toEqual(result);
  });

  it('escapes quotes', async () => {
    toCSVStream([
      {
        ...testEgo,
        [entityAttributesProperty]: {
          name: '"Queequeg"',
        },
      },
    ], writable);
    const csv = await writable.asString();
    const result = [
      ...baseCSVAttributes,
      'name\r\n1',
      'case id',
      789,
      'protocol name',
      100,
      200,
      300,
      '"""Queequeg"""\r\n',
    ].join(',');
    expect(csv).toEqual(result);
  });

  it('escapes quotes in attr names', async () => {
    toCSVStream([
      {
        ...testEgo,
        [entityAttributesProperty]: {
          '"quoted"': 1,
        },
      },
    ], writable);
    const csv = await writable.asString();
    const result = [
      ...baseCSVAttributes,
      '"""quoted"""\r\n1',
      'case id',
      789,
      'protocol name',
      100,
      200,
      300,
      '1\r\n',
    ].join(',');
    expect(csv).toEqual(result);
  });

  it('stringifies and quotes objects', async () => {
    toCSVStream([
      {
        ...testEgo,
        [entityAttributesProperty]: {
          location: { x: 1, y: 1 },
        },
      },
    ], writable);
    const csv = await writable.asString();
    const result = [
      ...baseCSVAttributes,
      'location\r\n1',
      'case id',
      789,
      'protocol name',
      100,
      200,
      300,
      '"{""x"":1,""y"":1}"\r\n',
    ].join(',');
    expect(csv).toEqual(result);
  });

  it('exports undefined values as blank', async () => {
    toCSVStream([
      {
        ...testEgo,
        [entityAttributesProperty]: {
          prop: undefined,
        },
      },
    ], writable);
    const csv = await writable.asString();
    const result = [
      ...baseCSVAttributes,
      'prop\r\n1',
      'case id',
      789,
      'protocol name',
      100,
      200,
      300,
      '\r\n',
    ].join(',');
    expect(csv).toEqual(result);
  });

  it('exports null values as blank', async () => {
    toCSVStream([
      {
        ...testEgo,
        [entityAttributesProperty]: {
          prop: null,
        },
      },
    ], writable);
    const csv = await writable.asString();
    const result = [
      ...baseCSVAttributes,
      'prop\r\n1',
      'case id',
      789,
      'protocol name',
      100,
      200,
      300,
      '\r\n',
    ].join(',');
    expect(csv).toEqual(result);
  });

  it('exports `false` values as "false"', async () => {
    toCSVStream([
      {
        ...testEgo,
        [entityAttributesProperty]: {
          prop: false,
        },
      },
    ], writable);
    const csv = await writable.asString();
    const result = [
      ...baseCSVAttributes,
      'prop\r\n1',
      'case id',
      789,
      'protocol name',
      100,
      200,
      300,
      'false\r\n',
    ].join(',');
    expect(csv).toEqual(result);
  });
});

describe('EgoListFormatter', () => {
  let writable;

  beforeEach(() => {
    writable = makeWriteableStream();
  });

  it('writeToStream returns an abort controller', () => {
    const formatter = new EgoListFormatter({}, mockCodebook, DEFAULT_EXPORT_OPTIONS);
    const controller = formatter.writeToStream(writable);
    expect(controller.abort).toBeInstanceOf(Function);
  });
});
