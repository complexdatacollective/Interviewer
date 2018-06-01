/* eslint-env jest */

import reducer, { actionCreators } from '../menu';

const initialState = {
  customMenuItems: [],
  settingsMenuIsOpen: false,
  stageMenuIsOpen: false,
  stageSearchTerm: '',
};

describe('menu reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should register new menu items', () => {
    const newItem = {
      id: 0,
      foo: 'bar',
    };

    expect(reducer(initialState, actionCreators.registerMenuItem(newItem))).toEqual({
      ...initialState,
      customMenuItems: [{ id: 0, foo: 'bar' }],
    });
  });

  it('should toggle the session menu', () => {
    expect(reducer(initialState, actionCreators.toggleSettingsMenu())).toEqual({
      ...initialState,
      settingsMenuIsOpen: true,
    });

    expect(
      reducer(
        {
          ...initialState,
          settingsMenuIsOpen: true,
        },
        actionCreators.toggleSettingsMenu(),
      ),
    ).toEqual({
      ...initialState,
      settingsMenuIsOpen: false,
    });
  });

  it('should toggle the stage menu', () => {
    expect(reducer(initialState, actionCreators.toggleStageMenu())).toEqual({
      ...initialState,
      stageMenuIsOpen: true,
    });

    expect(
      reducer(
        {
          ...initialState,
          stageMenuIsOpen: true,
        },
        actionCreators.toggleStageMenu(),
      ),
    ).toEqual({
      ...initialState,
      stageMenuIsOpen: false,
    });
  });

  it('should update stage search value', () => {
    const searchTerm = 'bob lob law';
    expect(reducer(initialState, actionCreators.updateStageSearch(searchTerm))).toEqual({
      ...initialState,
      stageSearchTerm: searchTerm,
    });
  });

  it('should unregister custom menu items', () => {
    expect(reducer({
      ...initialState,
      customMenuItems: [
        {
          id: 0,
          foo: 'bar',
        },
        {
          id: 1,
          bloo: 'blar',
        },
      ],
    }, actionCreators.unregisterMenuItem(1))).toEqual({
      ...initialState,
      customMenuItems: [{ id: 0, foo: 'bar' }],
    });
  });
});
