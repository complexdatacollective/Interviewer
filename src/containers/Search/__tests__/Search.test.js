/* eslint-env jest */

import React from 'react';
import { mount, render } from 'enzyme';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { Search } from '../Search';
import SearchResults from '../SearchResults';
import Card from '../../../components/Card';

const mockSearchResult = [{ attributes: { name: 'foo' } }];

jest.mock('../../../ui/utils/CSSVariables');

const mockProps = {
  dataSourceKey: '',
  closeSearch: () => {},
  primaryDisplayField: '',
  excludedNodes: [],
  options: {},
  onComplete: () => {},
  nodeTypeDefinition: {
    variables: {},
  },
  fuse: {
    search: () => mockSearchResult,
  },
};

const mockState = {
  activeSessionId: '62415a79-cd46-409a-98b3-5a0a2fef1f97',
  activeSessionWorkers: { nodeLabelWorker: 'blob:http://192.168.1.196:3000/b6cac5c5-1b4d-4db0-be86-fa55239fd62c' },
  deviceSettings: {
    description: 'Kirby (macOS)',
    useDynamicScaling: true,
    useFullScreenForms: false,
    interfaceScale: 100,
    showScrollbars: false,
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
  pairedServer: null,
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
  ui: { isMenuOpen: false },
};

describe('<Search />', () => {
  it('renders a search input', () => {
    const component = render(<Search {...mockProps} />);
    expect(component.find('input[type="search"]').length).toBe(1);
  });

  it('renders searchResults', () => {
    const component =
      mount(<Provider store={createStore(() => mockState)}><Search {...mockProps} /></Provider>);
    expect(component.find(SearchResults).length).toBe(1);
  });

  it('populates searchResults', () => {
    const component =
      mount(<Provider store={createStore(() => mockState)}><Search {...mockProps} /></Provider>);
    expect(component.find(Card).length).toBe(0);
    component.find('input[type="search"]').simulate('change', { target: { value: 'query' } });
    expect(component.find(Card).length).toBe(1);
  });
});
