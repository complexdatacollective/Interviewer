/* eslint-env jest */

import reducer, { actionCreators, actionTypes } from '../search';

const initialState = {
  collapsed: true,
  selectedResults: [],
};

describe('search reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {}),
    ).toEqual(initialState);
  });

  it('should handle OPEN_SEARCH', () => {
    const newState = reducer(initialState, { type: actionTypes.OPEN_SEARCH });
    expect(newState.collapsed).toBe(false);
  });

  it('should handle CLOSE_SEARCH', () => {
    const newState = reducer({
      ...initialState,
      collapsed: false,
    }, {
      type: actionTypes.CLOSE_SEARCH,
    });
    expect(newState.collapsed).toBe(true);
  });

  it('should handle TOGGLE_SEARCH', () => {
    let newState = initialState;
    newState = reducer(newState, { type: actionTypes.TOGGLE_SEARCH });
    expect(newState.collapsed).toBe(false);
    newState = reducer(newState, { type: actionTypes.TOGGLE_SEARCH });
    expect(newState.collapsed).toBe(true);
  });
});

describe('search actionCreators', () => {
  it('should provide a method to close', () => {
    const expectedAction = { type: actionTypes.CLOSE_SEARCH };
    expect(actionCreators.closeSearch()).toEqual(expectedAction);
  });

  it('should provide a method to open', () => {
    const expectedAction = { type: actionTypes.OPEN_SEARCH };
    expect(actionCreators.openSearch()).toEqual(expectedAction);
  });

  it('should provide a method to close()', () => {
    const expectedAction = { type: actionTypes.TOGGLE_SEARCH };
    expect(actionCreators.toggleSearch()).toEqual(expectedAction);
  });
});
