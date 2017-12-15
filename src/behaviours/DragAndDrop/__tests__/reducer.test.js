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
      it('triggers DRAG_MOVE', () => {
        const store = mockStore({
          targets: [],
          source: null,
        });

        store.dispatch(actions.dragMove({
          bazz: 'buzz',
        }));

        expect(store.getActions()).toEqual([
          {
            type: actionTypes.DRAG_MOVE,
            source: {
              bazz: 'buzz',
            },
          },
        ]);
      });

      it('calls onDrag on targets', () => {
        const onDrag = jest.fn();
        const missedTargetOnDrag = jest.fn();

        const store = mockStore({
          targets: [
            {
              x: 0,
              y: 0,
              width: 100,
              height: 100,
              accepts: () => true,
              onDrag,
            },
            {
              x: 100,
              y: 100,
              width: 100,
              height: 100,
              accepts: () => true,
              onDrag: missedTargetOnDrag,
            },
          ],
          source: null,
        });

        store.dispatch(actions.dragMove({
          foo: 'bar',
          x: 50,
          y: 50,
        }));

        expect(onDrag.mock.calls).toEqual([
          [{
            foo: 'bar',
            isOver: true,
            x: 50,
            y: 50,
          }],
        ]);

        expect(missedTargetOnDrag.mock.calls).toEqual([]);
      });
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
    it('triggers DRAG_MOVE', () => {
      const store = mockStore({
        targets: [],
        source: null,
      });

      store.dispatch(actions.dragEnd());

      expect(store.getActions()).toEqual([
        {
          type: actionTypes.DRAG_END,
        },
      ]);
    });

    it('calls onDrop on targets', () => {
      const onDrop = jest.fn();
      const onDrag = jest.fn();
      const missedTargetOnDrop = jest.fn();

      const store = mockStore({
        targets: [
          {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            accepts: () => true,
            onDrag,
            onDrop,
          },
          {
            x: 100,
            y: 100,
            width: 100,
            height: 100,
            accepts: () => true,
            onDrop: missedTargetOnDrop,
          },
        ],
        source: null,
      });

      store.dispatch(actions.dragEnd({
        foo: 'bar',
        x: 50,
        y: 50,
      }));

      expect(onDrop.mock.calls).toEqual([
        [{
          foo: 'bar',
          isOver: true,
          x: 50,
          y: 50,
        }],
      ]);

      expect(onDrag.mock.calls).toEqual([]);

      expect(missedTargetOnDrop.mock.calls).toEqual([]);
    });

    it('set source to null', () => {
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
          type: actionTypes.DRAG_END,
          source: {
            y: 50,
            z: 200,
          },
        },
      ]);

      expect(result.source).toEqual(null);
    });
  });
});
