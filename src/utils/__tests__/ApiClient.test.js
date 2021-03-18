/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import axios from 'axios';
import { decrypt } from 'secure-comms-api/cipher';

import ApiClient from '../ApiClient';
import * as Environment from '../Environment';

jest.mock('axios');
jest.mock('secure-comms-api/cipher');

describe('ApiClient', () => {
  const respData = { device: { id: '1' }, certificate: 'CERTIFICATE', securePort: 443 };
  const axiosResp = { data: { data: respData } };
  const url = 'http://example.com:123';
  let client;

  beforeAll(() => {
    axios.post.mockResolvedValue(axiosResp);
    axios.CancelToken = {
      source: jest.fn().mockReturnValue({ token: '' }),
    };
    axios.create.mockReturnValue(axios);
  });

  beforeEach(() => {
    Environment.isElectron = jest.fn().mockReturnValue(true);
    axios.post.mockClear();
    client = new ApiClient(url);
  });

  describe('constructor', () => {
    it('creates a pairing client from a pairingUrl', () => {
      expect(client.pairingClient).toBeDefined();
      expect(client.httpsClient).not.toBeDefined();
    });
    it('creates an https client from a pairedServer', () => {
      const pairedClient = new ApiClient({ secureServiceUrl: 'https://example.com:1234' });
      expect(pairedClient.httpsClient).toBeDefined();
      expect(pairedClient.pairingClient).not.toBeDefined();
    });
  });

  describe('pairing confirmation', () => {
    let pairingInfo;
    beforeEach(async () => {
      // data payload is encrypted; mock it on cipher
      decrypt.mockReturnValue(JSON.stringify(respData));
      pairingInfo = await client.confirmPairing();
    });

    it('returns device ID and secret', () => {
      expect(pairingInfo.device.id).toEqual(respData.device.id);
      expect(pairingInfo.device).toHaveProperty('secret');
    });

    it('returns an SSL cert for Server', () => {
      expect(pairingInfo.sslCertificate).toEqual(respData.certificate);
    });

    it('returns the secure port for SSL', () => {
      expect(pairingInfo.securePort).toEqual(respData.securePort);
    });
  });
});
