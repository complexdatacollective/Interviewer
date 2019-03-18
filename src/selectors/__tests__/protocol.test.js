/* eslint-env jest */

import * as Protocol from '../protocol';

const nodeVariables = {
  person: {
    iconVariant: 'add-a-person',
    color: 'node-color-seq-2',
  },
};

const protocolForm = {
  foo: 'bar',
};

const externalData = {
  baz: 'bar',
};

const mockProtocol = {
  externalData,
  codebook: {
    node: nodeVariables,
  },
  forms: protocolForm,
};

const mockProps = {
  type: 'person',
};

const mockState = {
  protocol: mockProtocol,
};

const emptyState = {
  protocol: {},
};

describe('protocol selector', () => {
  describe('memoed selectors', () => {
    it('should get protocol variable registery', () => {
      expect(Protocol.protocolRegistry(mockState)).toEqual({ node: nodeVariables });
      expect(Protocol.protocolRegistry(emptyState)).toEqual(undefined);
    });

    it('should get protocol forms', () => {
      expect(Protocol.protocolForms(mockState)).toEqual(protocolForm);
      expect(Protocol.protocolForms(emptyState)).toEqual(undefined);
    });

    it('should get node color', () => {
      const selected = Protocol.makeGetNodeColor();
      expect(selected(mockState, mockProps)).toEqual('node-color-seq-2');
    });
  });
});

