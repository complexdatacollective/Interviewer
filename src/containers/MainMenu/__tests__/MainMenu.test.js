/* eslint-env jest */

import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import epics from '../../../ducks/middleware/epics';
import rootReducer from '../../../ducks/modules/rootReducer';
import { actionCreators as uiActions } from '../../../ducks/modules/ui';
import MainMenu from '../MainMenu';

jest.mock('../../../ui/utils/CSSVariables');

const actionLogger = actions =>
  () =>
    next =>
      (action) => {
        actions.push(action);
        return next(action);
      };

const mockStore = (initialState = undefined) => {
  const actions = [];

  const store = createStore(
    rootReducer,
    initialState,
    compose(
      applyMiddleware(thunk, epics, actionLogger(actions)),
    ),
  );

  store.dispatch(uiActions.update({ isMenuOpen: true }));

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
    const { store } = mockStore();
    const subject = getSubject(store);

    expect(isMenuOpen(subject)).toBe(true);
    subject.find('Icon[name="close"]').simulate('click');
    expect(isMenuOpen(subject)).toBe(false);
  });

  it('Menu panel active state', () => {
    const { store } = mockStore();
    const subject = getSubject(store);

    gotoStages(subject);
    gotoSettings(subject);

    expect(subject.find('MenuPanel').at(0).prop('active')).toBe(true);
    expect(subject.find('MenuPanel').at(1).prop('active')).toBe(false);

    gotoStages(subject);

    expect(subject.find('MenuPanel').at(0).prop('active')).toBe(false);
    expect(subject.find('MenuPanel').at(1).prop('active')).toBe(true);
  });

  it('Return to start screen button', () => {
    const { store, actions } = mockStore();
    const subject = getSubject(store);

    subject.find('Button[children="Return to start screen"]').at(0).simulate('click');

    const redirectAction = actions.find(({ type }) => type === '@@router/CALL_HISTORY_METHOD');

    expect(actions.filter(({ type }) => type === 'END_SESSION').length).toBe(1);
    expect(redirectAction.payload).toMatchObject({
      method: 'push',
      args: ['/'],
    });
  });

  describe('Settings screen', () => {
    it('Reset state button', () => {
      const { store, actions } = mockStore();
      const subject = getSubject(store);

      gotoSettings(subject);

      subject.find('Button[children="Reset Network Canvas data"]').at(0).simulate('click');

      const redirectAction = actions.find(({ type }) => type === '@@router/CALL_HISTORY_METHOD');

      expect(redirectAction.payload).toMatchObject({
        method: 'push',
        args: ['/reset'],
      });
      expect(isMenuOpen(subject)).toBe(false);
    });

    it('Mock data button', () => {
      const { store, actions } = mockStore({
        session: '1234-5678',
        sessions: {
          '1234-5678': {
            network: {
              nodes: [],
            },
          },
        },
      });
      const subject = getSubject(store);

      gotoSettings(subject);

      subject.find('Button[children="Add mock nodes"]').at(0).simulate('click');

      expect(actions.filter(({ type }) => type === 'ADD_NODES').length).toBe(20);
      expect(isMenuOpen(subject)).toBe(false);
    });
  });
});
