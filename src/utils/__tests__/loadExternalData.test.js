/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
import loadExternalData from '../loadExternalData';

const mockProtocolName = 'myMockProtocol';
const mockAssetName = 'myMockSource';
const mockAssetType = 'network';
const mockResult = {
  nodes: [
    { foo: 'bar' },
  ],
};
const mockFetchResponse = {
  json: () => mockResult,
};

global.fetch = vi.fn(() => Promise.resolve(mockFetchResponse));

describe('loadExternalData', () => {
  it('returns a cancellable request', () => {});

  it('request response is json with uids', async () => {
    const result = await loadExternalData(mockProtocolName, mockAssetName, mockAssetType);
    expect(result.nodes.length).toBe(mockResult.nodes.length);
  });
});
