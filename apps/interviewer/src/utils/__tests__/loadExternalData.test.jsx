/* eslint-env jest */


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

global.fetch = jest.fn(() => Promise.resolve(mockFetchResponse));

describe('loadExternalData', () => {
  it('returns a cancellable request', () => { });

  it('request response is json with uids  ', (done) => {
    loadExternalData(mockProtocolName, mockAssetName, mockAssetType)
      .then((result) => {
        expect(result.nodes.length).toBe(mockResult.nodes.length);
        done();
      });
  });
});
