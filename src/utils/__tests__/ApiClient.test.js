/* eslint-env jest */

import axios from 'axios';

import ApiClient from '../ApiClient';
import { decrypt } from '../shared-api/cipher';

jest.mock('axios');
jest.mock('../shared-api/cipher');

describe('ApiClient', () => {
  const respData = { device: { id: '1' } };
  const axiosResp = { data: { data: respData } };

  beforeAll(() => {
    axios.post.mockResolvedValue(axiosResp);
    axios.CancelToken = {
      source: jest.fn().mockReturnValue({ token: '' }),
    };
    axios.create.mockReturnValue(axios);
  });

  beforeEach(() => {
    axios.post.mockClear();
  });

  describe('pairing confirmation', () => {
    beforeEach(() => {
      // data payload is encrypted; mock it on cipher
      decrypt.mockReturnValue(JSON.stringify(respData));
    });

    it('returns device ID and secret', async () => {
      const client = new ApiClient('');
      const device = await client.confirmPairing();
      expect(device.id).toEqual(respData.device.id);
      expect(device).toHaveProperty('secret');
    });
  });
});
