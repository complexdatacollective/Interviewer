/* eslint-env jest */

import reducer, { actionCreators } from '../modals';

const initialState = [];

describe('modal reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should register new modals', () => {
    expect(reducer(initialState, actionCreators.registerModal('foo'))).toEqual([
      ...initialState,
      {
        name: 'foo',
        open: false,
      },
    ]);
  });

  it('should register multiple modals', () => {
    const firstState = reducer(initialState, actionCreators.registerModal('modalA'));

    expect(firstState).toEqual([
      ...initialState,
      {
        name: 'modalA',
        open: false,
      },
    ]);

    const secondState = reducer(firstState, actionCreators.registerModal('modalB'));
    expect(secondState).toEqual([
      ...initialState,
      {
        name: 'modalA',
        open: false,
      },
      {
        name: 'modalB',
        open: false,
      },
    ]);
  });

  it('should unregister modals', () => {
    expect(
      reducer(
        [
          {
            name: 'foo',
            open: false,
          },
          {
            name: 'bar',
            open: false,
          },
        ],
        actionCreators.unregisterModal('foo'),
      ),
    ).toEqual([
      ...initialState,
      {
        name: 'bar',
        open: false,
      },
    ]);
  });

  it('should toggle modals', () => {
    expect(
      reducer(
        [
          {
            name: 'foo',
            open: false,
          },
        ],
        actionCreators.toggleModal('foo'),
      ),
    ).toEqual([
      ...initialState,
      {
        name: 'foo',
        open: true,
      },
    ]);

    expect(
      reducer(
        [
          {
            name: 'foo',
            open: true,
          },
        ],
        actionCreators.toggleModal('foo'),
      ),
    ).toEqual([
      ...initialState,
      {
        name: 'foo',
        open: false,
      },
    ]);
  });

  it('should open modals', () => {
    expect(
      reducer(
        [
          {
            name: 'foo',
            open: false,
          },
        ],
        actionCreators.openModal('foo'),
      ),
    ).toEqual([
      ...initialState,
      {
        name: 'foo',
        open: true,
      },
    ]);
  });

  it('should close modals', () => {
    expect(
      reducer(
        [
          {
            name: 'foo',
            open: true,
          },
        ],
        actionCreators.closeModal('foo'),
      ),
    ).toEqual([
      ...initialState,
      {
        name: 'foo',
        open: false,
      },
    ]);
  });
});
