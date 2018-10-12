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

let actions = [];

const actionLogger = () =>
  next =>
    (action) => {
      actions.push(action);
      return next(action);
    };

const mockStore = () => {
  actions = [];

  const store = createStore(
    rootReducer,
    undefined,
    compose(
      applyMiddleware(thunk, epics, actionLogger),
    ),
  );

  store.dispatch(uiActions.update({ isMenuOpen: true }));

  return store;
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

describe('<MainMenu />', () => {
  it('Close button', () => {
    const store = mockStore();
    const subject = getSubject(store);

    expect(isMenuOpen(subject)).toBe(true);
    subject.find('Icon[name="close"]').simulate('click');
    expect(isMenuOpen(subject)).toBe(false);
  });

  it('Menu panel active state', () => {
    const store = mockStore();
    const subject = getSubject(store);

    expect(subject.find('MenuPanel').at(0).prop('active')).toBe(false);
    expect(subject.find('MenuPanel').at(1).prop('active')).toBe(true);

    subject.find('MenuPanel').at(0).simulate('click');

    expect(subject.find('MenuPanel').at(0).prop('active')).toBe(true);
    expect(subject.find('MenuPanel').at(1).prop('active')).toBe(false);

    subject.find('MenuPanel').at(1).simulate('click');

    expect(subject.find('MenuPanel').at(0).prop('active')).toBe(false);
    expect(subject.find('MenuPanel').at(1).prop('active')).toBe(true);
  });

  it('Return to start screen button', () => {
    const store = mockStore();
    const subject = getSubject(store);

    subject.find('Button[children="Return to start screen"]').at(0).simulate('click');

    expect(!!actions.find(({ type }) => type === 'END_SESSION')).toBe(true);
    expect(!!actions.find(({ type }) => type === '@@router/CALL_HISTORY_METHOD')).toBe(true);
  });
});
