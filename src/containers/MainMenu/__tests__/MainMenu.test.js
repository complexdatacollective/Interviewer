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

const getMockStore = (initialState = undefined) => {
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

    subject.find('Button[children="Return to start screen"]').at(0).simulate('click');

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
      const mockStore = getMockStore({
        ui: { isMenuOpen: true },
        protocol: {
          variableRegistry: {
            node: {
              abcdef: {
                name: 'person',
                variables: {},
              },
            },
          },
        },
        session: '1234-5678',
        sessions: {
          '1234-5678': {
            network: {
              nodes: [],
            },
          },
        },
      });

      store = mockStore.store;
      actions = mockStore.actions;

      subject = getSubject(store);

      gotoSettings(subject);
    });

    // Todo: reinstate this test taking into account the dialog box
    // it('Reset state button', () => {
    //   subject.find('Button[children="Reset Network Canvas data"]').at(0).simulate('click');

    //   const redirectAction = actions.find(({ type }) => type === '@@router/CALL_HISTORY_METHOD');

    //   expect(redirectAction.payload).toMatchObject({
    //     method: 'push',
    //     args: ['/reset'],
    //   });
    //   expect(isMenuOpen(subject)).toBe(false);
    // });

    it('Mock data button', () => {
      subject.find('Button[children="Add mock nodes"]').at(0).simulate('click');

      expect(actions.filter(({ type }) => type === 'ADD_NODES').length).toBe(20);
      expect(isMenuOpen(subject)).toBe(false);
    });
  });

  describe('Stage screen', () => {
    let store;
    let actions;
    let subject;

    beforeEach(() => {
      const mockStore = getMockStore({
        protocol: {
          isLoaded: true,
          path: 'foo',
          type: 'bar',
          stages: [
            { id: '1234-5678-stage' },
          ],
        },
        session: '1234-5678-session',
        router: { location: { pathname: '/session/1234-5678-session/bar/foo/0' } },
        ui: { isMenuOpen: true },
      });

      store = mockStore.store;
      actions = mockStore.actions;

      subject = getSubject(store);

      gotoStages(subject);
    });

    it('Click stage', () => {
      subject.find('TimelineStage').at(0).simulate('click');

      const redirectAction = actions.find(({ type }) => type === '@@router/CALL_HISTORY_METHOD');

      expect(redirectAction.payload).toMatchObject({
        method: 'push',
        args: ['/session/1234-5678-session/bar/foo/0'],
      });

      expect(isMenuOpen(subject)).toBe(false);
    });
  });
});
