/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
import React from 'react';
import { mount, shallow } from 'enzyme';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

const mocksendMessageAsync = vi.fn().mockResolvedValue('');

vi.mock('../../utils/WorkerAgent', () => ({
  default: function MockWorkerAgent() {
    return { sendMessageAsync: mocksendMessageAsync };
  },
  NodeLabelWorkerName: 'nodeLabelWorker',
  supportedWorkers: ['nodeLabelWorker'],
  urlForWorkerSource: vi.fn((blob) => URL.createObjectURL(blob)),
}));

// Import after mock setup
import Node, { Node as UnconnectedNode } from '../Node';

const mockState = {
  activeSessionId: '62415a79-cd46-409a-98b3-5a0a2fef1f97',
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
  },
  ui: { settingsMenuOpen: false },
};

global.console.warn = vi.fn();

describe('a connected <Node />', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount((
      <Provider store={createStore(() => mockState)}>
        <Node />
      </Provider>
    ));
  });

  it('renders a Node', () => {
    expect(wrapper.find('Node').length).toBeGreaterThan(0);
  });
});

describe('<Node />', () => {
  let wrapper;
  const props = { getLabel: vi.fn(), type: 'person' };

  beforeEach(() => {
    wrapper = shallow(<UnconnectedNode {...props} />);
  });

  it('initializes a worker if workerUrl is defined', () => {
    expect(wrapper.instance().webWorker).not.toBeDefined();
    wrapper.setProps({ workerUrl: 'blob:file:' });
    expect(wrapper.instance().webWorker).toBeDefined();
  });

  it('cancels any pending messages when unmounting', () => {
    const cancelMessage = vi.fn();
    wrapper.instance().webWorker = { cancelMessage };
    wrapper.instance().outstandingMessage = {};
    expect(cancelMessage).not.toHaveBeenCalled();
    wrapper.unmount();
    expect(cancelMessage).toHaveBeenCalled();
  });

  describe('dynamic labeler', () => {
    const flushPromises = () => new Promise((resolve) => { setTimeout(resolve, 0); });

    it('sets a label on state', async () => {
      mocksendMessageAsync.mockResolvedValue('dynamic-label');
      wrapper = shallow(<UnconnectedNode {...props} workerUrl="blob:" />);
      await flushPromises();
      expect(wrapper.state('label')).toEqual('dynamic-label');
    });

    it('sets an error if dynamic label is empty', async () => {
      mocksendMessageAsync.mockResolvedValue('');
      wrapper = shallow(<UnconnectedNode {...props} workerUrl="blob:" />);
      await flushPromises();
      const state = wrapper.state();
      expect(state.label).not.toBeDefined();
      expect(state.workerError).toBeInstanceOf(Error);
      expect(state.workerError).toMatchObject({ message: 'Empty label' });
    });
  });
});
