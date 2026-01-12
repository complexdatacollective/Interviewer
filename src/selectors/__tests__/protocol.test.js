/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

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

const mockState = {
  activeSessionId: 'mockSession',
  activeSessionWorkers: { nodeLabelWorker: 'blob:http://192.168.1.196:3000/b6cac5c5-1b4d-4db0-be86-fa55239fd62c' },
  deviceSettings: {
    description: 'Kirby (macOS)',
    useDynamicScaling: true,
    useFullScreenForms: false,
    interfaceScale: 100,
  },
  dialogs: { dialogs: Array(0) },
  form: {},
  importProtocol: { status: 'inactive', step: 0 },
  installedProtocols: {
    'c67ae04d-e5d8-402a-9ded-49205bf6f290': {
      name: 'Protocol Name',
      codebook: {},
      assetManifest: {},
      description: '',
      forms: {},
      lastModified: '2018-10-01T00:00:00.000Z',
      stages: [],
    },
    mockProtocol,
  },
  search: {
    collapsed: true,
    selectedResults: [],
  },
  sessions: {
    '62415a79-cd46-409a-98b3-5a0a2fef1f97': {
      caseId: 'josh2',
      network: { ego: {}, nodes: [], edges: [] },
      promptIndex: 0,
      protocolUID: 'c67ae04d-e5d8-402a-9ded-49205bf6f290',
      stageIndex: 0,
      updatedAt: 1554130548004,
    },
    mockSession: {
      protocolUID: 'mockProtocol',
    },
  },
  ui: { settingsMenuOpen: false },
};

const emptyState = {
  installedProtocols: {},
};

describe('protocol selector', () => {
  describe('memoed selectors', () => {
    it('should get protocol codebook', () => {
      expect(Protocol.getProtocolCodebook(mockState)).toEqual({ node: nodeVariables });
      expect(Protocol.getProtocolCodebook(emptyState)).toEqual(undefined);
    });
  });
});
