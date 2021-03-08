/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */
import React from 'react';
import { createStore } from 'redux';
import { mount } from 'enzyme';
import { last } from 'lodash';
import withExternalData from '../withExternalData';
import loadExternalData from '../../utils/loadExternalData';
import { entityAttributesProperty } from '../../ducks/modules/network';

jest.mock('../../utils/loadExternalData');

const mockReducer = () => ({
  installedProtocols: {
    mockProtocol: {
      codebook: {
        node: {},
        edge: {},
      },
      assetManifest: {
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

const mockResult = {
  nodes: [
    {
      type: 'person',
      [entityAttributesProperty]: {
        fun: true,
      },
    },
  ],
};

const mockSource = 'bar';

loadExternalData
  .mockImplementation(() => Promise.resolve(mockResult));

describe('withExternalDataLoader', () => {
  let withExternalDataConfigured;

  beforeEach(() => {
    withExternalDataConfigured = withExternalData('source', 'externalData');
  });

  it('It fetches the external data based on the source prop', (done) => {
    const MockComponent = jest.fn(() => '');
    const EnhancedComponent = withExternalDataConfigured(MockComponent);

    mount((
      <EnhancedComponent
        store={createStore(mockReducer)}
        source={mockSource}
        stage={{ subject: { entity: 'node', type: 'person' } }}
      />
    ));

    setImmediate(() => {
      expect(last(MockComponent.mock.calls)[0])
        .toMatchObject({
          externalData: mockResult,
          source: mockSource,
        });

      done();
    });
  });
});
