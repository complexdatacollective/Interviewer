/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import { filenameFromURI } from '../importProtocol';

describe('importProtocol', () => {
  describe('helpers', () => {
    it('filenameFromURI should correctly extract protocol name', () => {
      const exampleUrl = 'https://documentation.networkcanvas.com/protocols/Public%20Health%20Protocol.netcanvas?foo=bar#bazz';
      expect(filenameFromURI(exampleUrl)).toEqual('Public Health Protocol.netcanvas');
    });
  });
});
