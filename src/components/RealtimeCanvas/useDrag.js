import { useRef, useCallback } from 'react';

const isTouch = (event) => typeof TouchEvent !== 'undefined' && event instanceof TouchEvent;

const getCoords = (event) => {
  if (isTouch(event)) {
    const touch = event.changedTouches.item(0);

    return {
      x: touch.clientX,
      y: touch.clientY,
    };
  }

  return {
    x: event.clientX,
    y: event.clientY,
  };
};

const moveDelta = (start, end) => ({
  dy: end.y - start.y,
  dx: end.x - start.x,
});

const useDrag = () => {
  const state = useRef({
    lastPosition: undefined,
    move: undefined,
    hasMoved: undefined,
    id: undefined,
  });

  const getMove = useCallback((e) => {
    const { x, y } = getCoords(e);
    const { dy, dx } = moveDelta(state.lastPosition, { x, y });

    return {
      x,
      y,
      dy,
      dx,
    };
  });

  const handleDragStart = useCallback((e, id) => {
    state.current.id = id;
    state.current.lastPosition = getCoords(e);
  });

  const handleDragMove = useCallback((e) => {
    if (!state.current.id) { return; }
    state.current.move = getMove(e);
    state.current.hasMoved = true;
  });

  const handleDragEnd = useCallback((e) => {
    if (!state.current.id) { return; }
    state.current.id = null;
    // TODO: capture last move
    // hasMoved = false;
    // move = null;
    // move = getMove(e);
    console.log('end', getMove(e));
  });

  return [state, handleDragStart, handleDragMove, handleDragEnd];
};

export default useDrag;
