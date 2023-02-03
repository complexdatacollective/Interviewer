/* eslint-env jest */

import React, { useEffect } from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { entityAttributesProperty } from '@codaco/shared-consts';
import useExternalData from '../useExternalData';
import loadExternalData from '../../utils/loadExternalData';

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

const MockComponent = ({ callback, source, subject }) => {
  const [data, status] = useExternalData(source, subject);
  useEffect(() => {
    callback(data, status);
  }, [status]);
  return null;
};

describe('useExternalData', () => {
  it('It fetches the external data based on the source prop', (done) => {
    loadExternalData
      .mockImplementationOnce(() => Promise.resolve(mockResult));

    let count = 0;

    const callback = (data, status) => {
      count += 1;

      switch (count) {
        case 1: {
          expect(data).toBe(null);
          expect(status).toEqual({
            isLoading: false,
            error: null,
          });
          break;
        }
        case 2: {
          expect(data).toBe(null);
          expect(status).toEqual({
            isLoading: true,
            error: null,
          });
          break;
        }
        case 3: {
          expect(data).toEqual([
            {
              _uid: '732fe1c27fb60956f12c9339b69f217d848acc74',
              attributes: { fun: true },
              type: 'person',
            },
          ]);
          expect(status).toEqual({
            isLoading: false,
            error: null,
          });
          break;
        }
        default:
      }
      if (count === 3) {
        done();
      }
    };

    mount((
      <Provider store={createStore(mockReducer)}>
        <MockComponent
          callback={callback}
          source={mockSource}
          subject={{ entity: 'node', type: 'person' }}
        />
      </Provider>
    ));
  });

  it('It catches errors', (done) => {
    const error = new Error('broken');
    loadExternalData
      .mockImplementationOnce(() => Promise.reject(error));
    let count = 0;

    const callback = (data, status) => {
      count += 1;

      switch (count) {
        case 1: {
          expect(data).toBe(null);
          expect(status).toEqual({
            isLoading: false,
            error: null,
          });
          break;
        }
        case 2: {
          expect(data).toBe(null);
          expect(status).toEqual({
            isLoading: true,
            error: null,
          });
          break;
        }
        case 3: {
          expect(data).toEqual(null);
          expect(status).toEqual({
            isLoading: false,
            error,
          });
          break;
        }
        default:
      }
      if (count === 3) {
        done();
      }
    };

    mount((
      <Provider store={createStore(mockReducer)}>
        <MockComponent
          callback={callback}
          source={mockSource}
          subject={{ entity: 'node', type: 'person' }}
        />
      </Provider>
    ));
  });
});
