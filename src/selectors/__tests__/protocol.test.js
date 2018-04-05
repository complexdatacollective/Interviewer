/* eslint-env jest */

import * as Protocol from '../protocol';

const nodeVariables = {
  person: {
    iconVariant: 'add-a-person',
    color: 'coral',
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
  variableRegistry: {
    node: nodeVariables,
  },
  forms: protocolForm,
};

const mockProps = {
  nodeType: 'person',
};

const mockState = {
  protocol: mockProtocol,
};

const emptyProps = {};
const emptyState = {
  protocol: {},
};

describe('protocol selector', () => {
  describe('memoed selectors', () => {
    it('should get protocol variable registery', () => {
      expect(Protocol.protocolRegistry(mockState, mockProps)).toEqual({ node: nodeVariables });
      expect(Protocol.protocolRegistry(emptyState, emptyProps)).toEqual(undefined);
    });

    it('should get protocol forms', () => {
      expect(Protocol.protocolForms(mockState, mockProps)).toEqual(protocolForm);
      expect(Protocol.protocolForms(emptyState, emptyProps)).toEqual(undefined);
    });

    it('should get external data', () => {
      expect(Protocol.getExternalData(mockState, mockProps)).toEqual(externalData);
      expect(Protocol.getExternalData(emptyState, emptyProps)).toEqual(undefined);
    });

    it('should get node color', () => {
      const selected = Protocol.makeGetNodeColor();
      expect(selected(mockState, mockProps)).toEqual('coral');
    });
  });
});
