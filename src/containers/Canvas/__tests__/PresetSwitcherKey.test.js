/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { shallow } from 'enzyme';
import { createStore } from 'redux';

import ConnectedPresetSwitcherKey, { PresetSwitcherKey } from '../PresetSwitcherKey';

describe('<PresetSwitcherKey />', () => {
  const props = { open: true };

  it('renders accordions of preset options', () => {
    const subject = shallow(<PresetSwitcherKey {...props} />);
    expect(subject.find('Accordion').length).toBeGreaterThan(1);
  });
});

describe('Connect(PresetSwitcherKey)', () => {
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
    ui: { settingsMenuOpen: false },
  };
  const mockProps = {
    displayEdges: [],
    highlights: [],
    subject: {},
  };
  let subject;

  beforeEach(() => {
    const portal = shallow(
      <ConnectedPresetSwitcherKey {...mockProps} store={createStore(() => mockState)} />);
    subject = portal.dive().find('Connect(PresetSwitcherKey)').dive();
  });

  it('provides a convexOptions prop', () => {
    expect(subject.prop('convexOptions')).toBeDefined();
  });

  it('provides an edges prop', () => {
    expect(subject.prop('edges')).toBeDefined();
  });

  it('provides a highlightLabels prop', () => {
    expect(subject.prop('highlightLabels')).toBeDefined();
  });
});
