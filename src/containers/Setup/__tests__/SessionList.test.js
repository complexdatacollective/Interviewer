/* eslint-env jest */

import React from 'react';
import { shallow, mount } from 'enzyme';
import { createStore } from 'redux';

import SessionList from '../SessionList';

const mockReduxState = {
  installedProtocols: {
    mockProtocol: {
      name: 'Protocol Name',
      codebook: {},
      assetManifest: {},
      description: '',
      forms: {},
      lastModified: '2018-10-01T00:00:00.000Z',
      stages: [],
    },
  },
  sessions: {
    a: {
      caseId: 'case1',
      network: { ego: {}, nodes: [0, 1, 2], edges: [0] },
      promptIndex: 2,
      protocolUID: 'mockProtocol',
      stageIndex: 2,
      updatedAt: 1554130548004,
    },
    b: {
      caseId: 'case22',
      network: { ego: {}, nodes: [], edges: [] },
      promptIndex: 1,
      protocolUID: 'mockProtocol',
      stageIndex: 2,
      updatedAt: 1554130540000,
    },
  },
  activeSessionId: 'case1',
};

describe('<SessionList />', () => {
  it('renders ok', () => {
    const component = shallow(<SessionList store={createStore(() => mockReduxState)} />);
    expect(component).toMatchSnapshot();
  });

  it('shows sessions as cards', () => {
    const component = mount(<SessionList store={createStore(() => mockReduxState)} />);
    expect(component.find('.card').length).toBe(2);
  });
});
