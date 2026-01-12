/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React, { useEffect } from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { entityAttributesProperty } from '@codaco/shared-consts';
import useExternalData from '../useExternalData';
import loadExternalData from '../../utils/loadExternalData';

vi.mock('../../utils/loadExternalData');

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

const MockComponent = ({ onStatusChange, source, subject }) => {
  const [data, status] = useExternalData(source, subject);
  useEffect(() => {
    onStatusChange(data, status);
  }, [status, data, onStatusChange]);
  return null;
};

describe('useExternalData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('It fetches the external data based on the source prop', async () => {
    loadExternalData.mockImplementation(() => Promise.resolve(mockResult));

    let finalData = null;
    let finalStatus = null;

    await new Promise((resolve) => {
      const onStatusChange = (data, status) => {
        finalData = data;
        finalStatus = status;
        // Resolve when we have data and loading is complete
        if (data !== null && status.isLoading === false) {
          resolve();
        }
      };

      mount((
        <Provider store={createStore(mockReducer)}>
          <MockComponent
            onStatusChange={onStatusChange}
            source={mockSource}
            subject={{ entity: 'node', type: 'person' }}
          />
        </Provider>
      ));
    });

    // The final result should have data loaded
    expect(finalStatus).toEqual({
      isLoading: false,
      error: null,
    });
    // Check that data was transformed - should have type and attributes
    expect(finalData).toHaveLength(1);
    expect(finalData[0].type).toBe('person');
    expect(finalData[0].attributes).toEqual({ fun: true });
  });

  it('It catches errors', async () => {
    const error = new Error('broken');
    loadExternalData.mockImplementation(() => Promise.reject(error));

    let finalStatus = null;

    await new Promise((resolve) => {
      const onStatusChange = (data, status) => {
        finalStatus = status;
        // Resolve when we have an error
        if (status.error !== null) {
          resolve();
        }
      };

      mount((
        <Provider store={createStore(mockReducer)}>
          <MockComponent
            onStatusChange={onStatusChange}
            source={mockSource}
            subject={{ entity: 'node', type: 'person' }}
          />
        </Provider>
      ));
    });

    expect(finalStatus).toEqual({
      isLoading: false,
      error,
    });
  });
});
