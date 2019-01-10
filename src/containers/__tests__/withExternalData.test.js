/* eslint-env jest */
import React from 'react';
import { createStore } from 'redux';
import { mount } from 'enzyme';
import { last } from 'lodash';
import withExternalData from '../withExternalData';
import loadExternalData from '../../utils/loadExternalData';

jest.mock('../../utils/loadExternalData');

const mockReducer = () => ({
  sessions: {
    foo: { protocolPath: 'fakeProtocol' },
  },
  protocol: {
    type: 'bazz',
  },
  session: 'foo',
});

const mockResult = {
  bar: 'bazz',
};

const mockSource = 'bar';

loadExternalData
  .mockImplementation(() =>
    Promise.resolve({
      request: Promise.resolve(mockResult),
      abortController: () => {},
    }),
  );

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
