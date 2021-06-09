/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */
import React, { useEffect } from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import useExternalData from '../useExternalData';
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

const MockComponent = ({ callback, source, subject }) => {
  const [data, isLoading] = useExternalData(source, subject);
  useEffect(() => {
    callback(data, isLoading);
  }, [isLoading]);
  return null;
};

loadExternalData
  .mockImplementation(() => Promise.resolve(mockResult));

describe('useExternalData', () => {
  it('It fetches the external data based on the source prop', (done) => {
    let count = 0;

    const callback = (data, isLoading) => {
      count += 1;

      switch (count) {
        case 1: {
          expect(data).toBe(null);
          expect(isLoading).toBe(false);
          break;
        }
        case 2: {
          expect(data).toBe(null);
          expect(isLoading).toBe(true);
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
          expect(isLoading).toBe(false);
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
