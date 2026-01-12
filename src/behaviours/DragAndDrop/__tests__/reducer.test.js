/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
/* eslint-disable @codaco/spellcheck/spell-checker */

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import reducer, { actionCreators as actions, actionTypes } from '../reducer';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const hitAttributes = (isOver = false, willAccept = false) => ({
  isOver,
  willAccept,
});

const getResult = (actionsToPerform = [], initialState = undefined) => (
  actionsToPerform.reduce((memo, action) => reducer(memo, action), initialState)
);

describe('reducer', () => {
  it('initialState', () => {
    expect(
      reducer(undefined, { action: null }),
    ).toEqual({
      obstacles: [],
      targets: [],
      source: null,
    });
  });

  describe('UPSERT_TARGET', () => {
    it('when new add to list', () => {
      const result = getResult([
        actions.upsertTarget({
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
        actions.upsertTarget({
          id: 'foo',
          count: 3,
        }),
        actions.upsertTarget({
          id: 'bar',
          count: 7,
        }),
        actions.upsertTarget({
          id: 'foo',
          count: 5,
        }),
      ]);

      expect(result.targets).toEqual([
        { id: 'bar', count: 7, ...hitAttributes() },
        { id: 'foo', count: 5, ...hitAttributes() },
      ]);
    });
  });

  describe('RENAME_TARGET', () => {
    it('upserts the target ids', () => {
      const result = getResult([
        actions.upsertTarget({
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
        actions.upsertTarget({
          id: 'foo',
          count: 8,
        }),
        actions.removeTarget('foo'),
      ]);

      expect(result.targets).toEqual([
      ]);
    });
  });

  describe('UPSERT_OBSTACLE', () => {
    it('when new add to list', () => {
      const result = getResult([
        actions.upsertObstacle({
          id: 'foo',
          count: 3,
        }),
      ]);

      expect(result.obstacles).toEqual([
        { id: 'foo', count: 3, ...hitAttributes() },
      ]);
    });

    it('when existing replace previous instance', () => {
      const result = getResult([
        actions.upsertObstacle({
          id: 'foo',
          count: 3,
        }),
        actions.upsertObstacle({
          id: 'bar',
          count: 7,
        }),
        actions.upsertObstacle({
          id: 'foo',
          count: 5,
        }),
      ]);

      expect(result.obstacles).toEqual([
        { id: 'bar', count: 7, ...hitAttributes() },
        { id: 'foo', count: 5, ...hitAttributes() },
      ]);
    });
  });

  describe('REMOVE_OBSTACLE', () => {
    it('remove obstacle from list', () => {
      const result = getResult([
        actions.upsertObstacle({
          id: 'foo',
          count: 8,
        }),
        actions.removeObstacle('foo'),
      ]);

      expect(result.obstacles).toEqual([
      ]);
    });
  });

  describe('DRAG_START', () => {
    it('add source to the state', () => {
      const result = getResult([
        actions.upsertTarget({
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
        isOutOfBounds: false,
      });
    });
  });

  describe('DRAG_MOVE', () => {
    describe('dragMove', () => {
      it('triggers DRAG_MOVE', () => {
        const store = mockStore({
          obstacles: [],
          targets: [],
          source: null,
        });

        const setValidMove = vi.fn();
        store.dispatch(actions.dragMove({
          bazz: 'buzz',
          setValidMove,
        }));

        expect(setValidMove.mock.calls.length).toBe(1);
        expect(store.getActions()).toEqual([
          {
            type: actionTypes.DRAG_MOVE,
            source: {
              bazz: 'buzz',
              setValidMove,
            },
          },
        ]);
      });

      it('calls onDrag on targets', () => {
        const onDrag = vi.fn();
        const missedTargetOnDrag = vi.fn();
        const setValidMove = vi.fn();

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
          obstacles: [],
        });

        store.dispatch(actions.dragMove({
          foo: 'bar',
          x: 50,
          y: 50,
          setValidMove,
        }));

        expect(onDrag.mock.calls).toEqual([
          [{
            foo: 'bar',
            isOver: true,
            isOutOfBounds: false,
            x: 50,
            y: 50,
            setValidMove,
          }],
        ]);

        expect(setValidMove.mock.calls.length).toBe(2);
        expect(missedTargetOnDrag.mock.calls).toEqual([]);
      });
    });

    it('upsert source properties', () => {
      const result = getResult([
        actions.upsertTarget({
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
        isOutOfBounds: false,
      });
    });
  });

  describe('DRAG_END', () => {
    it('triggers DRAG_MOVE', () => {
      const store = mockStore({
        obstacles: [],
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
      const onDrop = vi.fn();
      const onDrag = vi.fn();
      const onDragEnd = vi.fn();
      const missedTargetOnDrop = vi.fn();

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
            onDragEnd,
          },
          {
            x: 100,
            y: 100,
            width: 100,
            height: 100,
            accepts: () => true,
            onDrop: missedTargetOnDrop,
            onDragEnd,
          },
        ],
        source: null,
        obstacles: [],
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
          isOutOfBounds: false,
          x: 50,
          y: 50,
        }],
      ]);

      expect(onDrag.mock.calls).toEqual([]);

      expect(missedTargetOnDrop.mock.calls).toEqual([]);

      expect(onDragEnd.mock.calls).toEqual([
        [{
          foo: 'bar',
          isOver: true,
          isOutOfBounds: false,
          x: 50,
          y: 50,
        }],
        [{
          foo: 'bar',
          isOver: true,
          isOutOfBounds: false,
          x: 50,
          y: 50,
        }],
      ]);
    });

    it('only calls onDrop on targets if no obstacles overlap', () => {
      const onDrop = vi.fn();
      const onDrag = vi.fn();
      const onDragEnd = vi.fn();
      const missedTargetOnDrop = vi.fn();

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
            onDragEnd,
          },
          {
            x: 100,
            y: 100,
            width: 100,
            height: 100,
            accepts: () => true,
            onDrop: missedTargetOnDrop,
            onDragEnd,
          },
        ],
        source: null,
        obstacles: [
          {
            x: 30,
            y: 30,
            width: 50,
            height: 50,
            accepts: () => true,
          },
        ],
      });

      store.dispatch(actions.dragEnd({
        foo: 'bar',
        x: 50,
        y: 50,
      }));

      expect(onDrop.mock.calls).toEqual([]);

      expect(onDrag.mock.calls).toEqual([]);

      expect(missedTargetOnDrop.mock.calls).toEqual([]);

      expect(onDragEnd.mock.calls).toEqual([
        [{
          foo: 'bar',
          isOver: true,
          isOutOfBounds: false,
          x: 50,
          y: 50,
        }],
        [{
          foo: 'bar',
          isOver: true,
          isOutOfBounds: false,
          x: 50,
          y: 50,
        }],
      ]);

      store.dispatch(actions.dragEnd({
        foo: 'bar',
        x: 90,
        y: 90,
      }));

      expect(onDrop.mock.calls).toEqual([
        [{
          foo: 'bar',
          isOver: true,
          isOutOfBounds: false,
          x: 90,
          y: 90,
        }],
      ]);
    });

    it('set source to null', () => {
      const result = getResult([
        actions.upsertTarget({
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
