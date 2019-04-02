/* eslint-env jest */

import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import epics from '../../../ducks/middleware/epics';
import rootReducer from '../../../ducks/modules/rootReducer';
import MainMenu from '../MainMenu';

const actionLogger = actions =>
  () =>
    next =>
      (action) => {
        actions.push(action);
        return next(action);
      };

const initialState = {
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
      codebook: {
        node: {
          abcdef: {
            name: 'person',
            variables: {},
          },
        },
      },
      assetManifest: {},
      description: '',
      forms: {},
      lastModified: '2018-10-01T00:00:00.000Z',
      stages: [{ subject: { type: 'abcdef' }, prompts: [{}] }],
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
  ui: { isMenuOpen: true },
  router: {
    location: {
      pathname: '',
    },
  },
};

const getMockStore = () => {
  const actions = [];

  const store = createStore(
    rootReducer,
    initialState,
    compose(
      applyMiddleware(thunk, epics, actionLogger(actions)),
    ),
  );

  return { store, actions };
};

const getSubject = store =>
  mount((
    <Provider
      store={store}
    >
      <MainMenu />
    </Provider>
  ));

const isMenuOpen = subject =>
  subject.find('MainMenu').prop('isOpen');

const gotoSettings = subject =>
  subject.find('MenuPanel').at(0).simulate('click');

const gotoStages = subject =>
  subject.find('MenuPanel').at(1).simulate('click');

describe('<MainMenu />', () => {
  it('Close button', () => {
    const { store } = getMockStore({ ui: { isMenuOpen: true } });
    const subject = getSubject(store);

    expect(isMenuOpen(subject)).toBe(true);
    subject.find('Icon[name="close"]').simulate('click');
    expect(isMenuOpen(subject)).toBe(false);
  });

  it('Return to start screen button', () => {
    const { store, actions } = getMockStore({ ui: { isMenuOpen: true } });
    const subject = getSubject(store);

    subject.find('.main-menu__return-button').at(0).simulate('click');

    const redirectAction = actions.find(({ type }) => type === '@@router/CALL_HISTORY_METHOD');

    expect(redirectAction.payload).toMatchObject({
      method: 'push',
      args: ['/'],
    });

    expect(actions.filter(({ type }) => type === 'END_SESSION').length).toBe(1);

    expect(isMenuOpen(subject)).toBe(false);
  });

  describe('Settings screen', () => {
    let store;
    let actions;
    let subject;

    beforeEach(() => {
      const mockStore = getMockStore();
      store = mockStore.store;
      actions = mockStore.actions;

      subject = getSubject(store);

      gotoSettings(subject);
    });

    it('Mock data button', () => {
      subject.find('Button[children="Add mock nodes"]').at(0).simulate('click');

      expect(actions.filter(({ type }) => type === 'ADD_NODE')).toHaveLength(20);
      expect(isMenuOpen(subject)).toBe(false);
    });
  });

  describe('Stage screen', () => {
    let store;
    let subject;

    beforeEach(() => {
      const mockStore = getMockStore(initialState);

      store = mockStore.store;

      subject = getSubject(store);

      gotoStages(subject);
    });
  });
});
