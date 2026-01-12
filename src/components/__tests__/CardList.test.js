/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { shallow } from 'enzyme';
import CardList from '../CardList';

vi.mock('@codaco/ui/lib/utils/CSSVariables');

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

const nodes = [
  { uid: 'a', name: 'a name', age: '22' },
  { uid: 'b', name: 'b name', age: '88' },
  { uid: 'c', name: 'c name', age: '33' },
];

describe('CardList component', () => {
  it('renders cards with list', () => {
    const component = shallow(
      <Provider store={createStore(() => mockState)}>
        <CardList
          nodes={nodes}
          label={(node) => node.name}
          details={(node) => [{ age: `${node.age}` }]}
          onToggleCard={() => {}}
          selected={() => false}
        />
      </Provider>,
    );

    expect(component).toMatchSnapshot();
  });
});
