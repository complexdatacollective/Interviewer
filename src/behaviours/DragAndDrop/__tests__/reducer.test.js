/* eslint-env jest */

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import reducer, { actionCreators as actions, actionTypes } from '../reducer';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const hitAttributes = (isOver = false, willAccept = false) => ({
  isOver,
  willAccept,
});

const getResult = (actionsToPerform = [], initialState = undefined) =>
  actionsToPerform.reduce((memo, action) => reducer(memo, action), initialState);

describe('reducer', () => {
  it('initialState', () => {
    expect(
      reducer(undefined, { action: null }),
    ).toEqual({
      targets: [],
      source: null,
    });
  });

  describe('UPDATE_TARGET', () => {
    it('when new add to list', () => {
      const result = getResult([
        actions.updateTarget({
          id: 'foo',
          count: 3,
        }),
      ]);

      expect(result.targets).toEqual([
        { id: 'foo', count: 3, ...hitAttributes() },
      ]);
    });

    it('when existing replace previous instance', () => {
      const result = getResult([
        actions.updateTarget({
          id: 'foo',
          count: 3,
        }),
        actions.updateTarget({
          id: 'bar',
          count: 7,
        }),
        actions.updateTarget({
          id: 'foo',
          count: 5,
        }),
      ]);

      expect(result.targets).toEqual([
        { id: 'foo', count: 5, ...hitAttributes() },
        { id: 'bar', count: 7, ...hitAttributes() },
      ]);
    });
  });

  describe('RENAME_TARGET', () => {
    it('updates the target ids', () => {
      const result = getResult([
        actions.updateTarget({
          id: 'foo',
          count: 8,
        }),
        actions.renameTarget({
          from: 'foo',
          to: 'bazz',
        }),
      ]);

      expect(result.targets).toEqual([
        { id: 'bazz', count: 8, ...hitAttributes() },
      ]);
    });
  });

  describe('REMOVE_TARGET', () => {
    it('remove target from list', () => {
      const result = getResult([
        actions.updateTarget({
          id: 'foo',
          count: 8,
        }),
        actions.removeTarget('foo'),
      ]);

      expect(result.targets).toEqual([
      ]);
    });
  });

  describe('DRAG_START', () => {
    it('add source to the state', () => {
      const result = getResult([
        actions.updateTarget({
          id: 'foo',
          accepts: () => {},
        }),
        actions.dragStart({
          bazz: 'buzz',
        }),
      ]);

      expect(result.source).toEqual({
        bazz: 'buzz',
        isOver: false,
      });
    });
  });

  describe('DRAG_MOVE', () => {
    describe('dragMove', () => {
      it('triggers DRAG_MOVE');
      it('calls onDrag on targets');
    });

    it('update source properties', () => {
      const result = getResult([
        actions.updateTarget({
          id: 'foo',
          accepts: () => {},
        }),
        actions.dragStart({
          x: 100,
          y: 100,
        }),
        {
          type: actionTypes.DRAG_MOVE,
          source: {
            y: 50,
            z: 200,
          },
        },
      ]);

      expect(result.source).toEqual({
        x: 100,
        y: 50,
        z: 200,
        isOver: false,
      });
    });
  });

  describe('DRAG_END', () => {
    it('remove target from list');
  });
});
