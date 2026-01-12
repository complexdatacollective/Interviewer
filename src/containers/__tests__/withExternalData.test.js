/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { createStore } from 'redux';
import { mount } from 'enzyme';
import { last } from 'lodash';
import { entityAttributesProperty } from '@codaco/shared-consts';
import withExternalData from '../withExternalData';
import loadExternalData from '../../utils/loadExternalData';

vi.mock('../../utils/loadExternalData');

const mockReducer = () => ({
  installedProtocols: {
    mockProtocol: {
      codebook: {
        node: {
          person: {
            name: 'person',
            variables: {
              '789-123': {
                name: 'silly',
                type: 'string',
              },
              '1011-12': {
                name: 'fun',
                type: 'boolean',
              },
            },
          },
        },
        edge: {},
      },
      assetManifest: {
        foo: {
          name: 'bar',
          source: 'file.csv',
          type: 'network',
        },
        bar: {
          name: 'bar',
          source: 'file.json',
          type: 'network',
        },
      },
    },
  },
  activeSessionId: 'foo',
  sessions: {
    foo: {
      protocolUID: 'mockProtocol',
    },
  },
});

const mockData1 = {
  nodes: [
    {
      type: 'person',
      [entityAttributesProperty]: {
        fun: true,
        happy: 'true',
        campy: '42',
        silly: 42,
      },
    },
  ],
};

const mockResult1 = {
  nodes: [
    {
      type: 'person',
      [entityAttributesProperty]: {
        '1011-12': true,
        happy: 'true',
        campy: '42',
        '789-123': 42,
      },
    },
  ],
};

const mockData2 = {
  nodes: [
    {
      type: 'person',
      [entityAttributesProperty]: {
        fun: 'true',
        happy: 'true',
        campy: '42',
        silly: '42',
      },
    },
  ],
};

const mockCsvResult2 = {
  nodes: [
    {
      type: 'person',
      [entityAttributesProperty]: {
        '1011-12': true,
        happy: true,
        campy: 42,
        '789-123': '42',
      },
    },
  ],
};

const mockSource1 = 'bar';
const mockSource2 = 'foo';

loadExternalData
  .mockImplementationOnce(() => Promise.resolve(mockData1))
  .mockImplementationOnce(() => Promise.resolve(mockData2));

describe('withExternalDataLoader', () => {
  let withExternalDataConfigured;

  beforeEach(() => {
    withExternalDataConfigured = withExternalData('source', 'externalData');
  });

  it('It fetches the external data based on the source prop', async () => {
    const MockComponent = vi.fn(() => '');
    const EnhancedComponent = withExternalDataConfigured(MockComponent);

    mount((
      <EnhancedComponent
        store={createStore(mockReducer)}
        source={mockSource1}
        stage={{ subject: { entity: 'node', type: 'person' } }}
      />
    ));

    await new Promise((resolve) => { setImmediate(resolve); });

    expect(last(MockComponent.mock.calls)[0])
      .toMatchObject({
        externalData: mockResult1,
        source: mockSource1,
      });
  });

  it('It converts external csv data based on the codebook', async () => {
    const MockComponent = vi.fn(() => '');
    const EnhancedComponent = withExternalDataConfigured(MockComponent);

    mount((
      <EnhancedComponent
        store={createStore(mockReducer)}
        source={mockSource2}
        stage={{ subject: { entity: 'node', type: 'person' } }}
      />
    ));

    await new Promise((resolve) => { setImmediate(resolve); });

    expect(last(MockComponent.mock.calls)[0])
      .toMatchObject({
        externalData: mockCsvResult2,
        source: mockSource2,
      });
  });
});
