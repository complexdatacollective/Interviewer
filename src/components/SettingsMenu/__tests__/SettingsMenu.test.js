/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import { createHashHistory as createHistory } from 'history';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import SettingsMenu from '../SettingsMenu';
import createRootReducer from '../../../ducks/modules/rootReducer';

vi.mock('@codaco/ui/lib/utils/CSSVariables');

vi.mock('framer-motion', async () => {
  const React = await import('react');
  const createMotionComponent = (tag) => {
    const Component = React.forwardRef(({ children, layout, variants, animate, initial, exit, ...props }, ref) => (
      React.createElement(tag, { ...props, ref }, children)
    ));
    Component.displayName = `motion.${tag}`;
    return Component;
  };

  return {
    motion: {
      div: createMotionComponent('div'),
      span: createMotionComponent('span'),
      ul: createMotionComponent('ul'),
      li: createMotionComponent('li'),
      nav: createMotionComponent('nav'),
      article: createMotionComponent('article'),
      section: createMotionComponent('section'),
    },
    AnimatePresence: ({ children }) => children,
    useMotionValue: () => ({ get: () => 0, set: () => {} }),
    useSpring: () => ({ get: () => 0, set: () => {} }),
  };
});

const actionLogger = (actions) => () => (next) => (action) => {
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
    startFullScreen: false,
    interfaceScale: 100,
  },
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
  ui: { settingsMenuOpen: true },
  router: {
    location: {
      pathname: '',
    },
  },
};

const getMockStore = () => {
  const actions = [];

  const history = createHistory();

  const store = createStore(
    createRootReducer(history),
    initialState,
    compose(
      applyMiddleware(routerMiddleware(history), thunk, actionLogger(actions)),
    ),
  );
  return { store, actions };
};

const isMenuOpen = (subject) => subject.find('SettingsMenu').prop('settingsMenuOpen');

const getSubject = (store) => mount((
  <Provider
    store={store}
  >
    <SettingsMenu />
  </Provider>
));

describe('<SettingsMenu />', () => {
  it('Close button closes menu', () => {
    const { store } = getMockStore();
    const subject = getSubject(store);

    expect(isMenuOpen(subject)).toBe(true);
    subject.find('Icon[name="close"]').at(0).simulate('click');
    expect(isMenuOpen(subject)).toBe(false);
  });

  it('Navigation changes tab', () => {
    const { store } = getMockStore();
    const subject = getSubject(store);

    subject.find('li[data-name="Developer Options"]').simulate('click');
    expect(subject.find('DeveloperTools')).toHaveLength(1);
  });

  describe('Developer options screen', () => {
    let store;
    let actions;
    let subject;

    beforeEach(() => {
      const mockStore = getMockStore();
      store = mockStore.store;
      actions = mockStore.actions;

      subject = getSubject(store);
    });

    it('Add Mock Nodes', () => {
      subject.find('li[data-name="Developer Options"]').simulate('click');

      subject.find('#add-mock-nodes').at(0).simulate('click');

      expect(actions.filter(({ type }) => type === 'ADD_NODE')).toHaveLength(20);
    });
  });
});
