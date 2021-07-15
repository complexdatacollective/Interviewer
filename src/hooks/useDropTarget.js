/* eslint-disable react/no-find-dom-node, react/jsx-props-no-spreading */

import { useRef, useEffect } from 'react';
import { actionCreators as actions } from '../behaviours/DragAndDrop/reducer';
import getAbsoluteBoundingRect from '../utils/getAbsoluteBoundingRect';
import store from '../behaviours/DragAndDrop/store';

const maxFramesPerSecond = 10;

const useDropTarget = (
  ref,
  {
    id,
    onDrop,
    onDrag,
    onDragEnd,
    accepts = () => false,
    meta = () => ({}),
  },
) => {
  const raf = useRef();

  const update = () => {
    if (!ref.current) { return; }

    const boundingClientRect = getAbsoluteBoundingRect(ref.current);

    console.log(' update ');

    store.dispatch(
      actions.upsertTarget({
        id,
        onDrop,
        onDrag,
        onDragEnd,
        accepts,
        meta: meta(),
        width: boundingClientRect.width,
        height: boundingClientRect.height,
        y: boundingClientRect.top,
        x: boundingClientRect.left,
      }),
    );

    raf.current = requestAnimationFrame(update);
  };

  const removeTarget = () => {
    store.dispatch(
      actions.removeTarget(id),
    );
  };

  useEffect(() => {
    if (ref.current) {
      update();
    }

    return () => {
      removeTarget();
      cancelAnimationFrame(raf);
    };
  }, [ref.current]);
};

export default useDropTarget;
