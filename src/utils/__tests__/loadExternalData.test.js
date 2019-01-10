/* eslint-env jest */
import { nodePrimaryKeyProperty } from '../../ducks/modules/network';
import loadExternalData from '../loadExternalData';

const mockProtocolName = 'myMockProtocol';
const mockAssetName = 'myMockSource';
const mockProtocolType = null;
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
  it('returns a cancellable request', (done) => {
    loadExternalData(mockProtocolName, mockAssetName, mockProtocolType)
      .then(({ abortController }) => {
        expect(abortController instanceof AbortController).toBe(true);
        done();
      });
  });
  it('request response is json with uids  ', (done) => {
    loadExternalData(mockProtocolName, mockAssetName, mockProtocolType)
      .then(({ request }) => request)
      .then((result) => {
        expect(result.nodes.length).toBe(mockResult.nodes.length);
        expect(result.nodes.every(
          node => Object.prototype.hasOwnProperty.call(node, nodePrimaryKeyProperty),
        )).toBe(true);
        done();
      });
  });
});
