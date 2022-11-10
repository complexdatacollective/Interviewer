/* eslint-disable react/no-find-dom-node, react/sort-comp, react/jsx-props-no-spreading */

import React, { useEffect, useRef, useState } from 'react';
import { throttle } from 'lodash';
import DragPreview from './DragPreview';
import DragManager, { VERTICAL_SCROLL } from './DragManager';
import { actionCreators as actions } from './reducer';
import store from './store';

const dragSource = (WrappedComponent) => ({
  allowDrag = true,
  meta = () => ({}),
  scrollDirection = VERTICAL_SCROLL,
  preview,
  ...rest
}) => {
  const node = useRef();
  const previewRef = useRef();
  let dragManager = null;
  let previewEl = null;

  const [isDragging, setIsDragging] = useState(false);

  const cleanupDragManager = () => {
    if (dragManager) {
      dragManager.unmount();
      dragManager = null;
    }
  };

  const cleanupPreview = () => {
    if (previewEl) {
      previewEl.cleanup();
      previewEl = null;
    }
  };

  const createPreview = () => {
    if (!preview) {
      previewEl = new DragPreview(node.current);
      return;
    }

    previewEl = new DragPreview(previewRef.current);
  };

  const updatePreview = ({ x, y }) => {
    if (previewEl) {
      previewEl.position({ x, y });
    }
  };

  const setValidMove = (valid) => {
    if (!previewEl) return;
    previewEl.setValidMove(valid);
  };

  const onDragStart = (movement) => {
    createPreview();

    store.dispatch(
      actions.dragStart({
        ...movement,
        meta: meta(),
      }),
    );

    setIsDragging(true);
  };

  const throttledDragAction = throttle(({ x, y, ...other }) => {
    store.dispatch(
      actions.dragMove({
        x, y, setValidMove, ...other,
      }),
    );
  }, 60);

  const onDragMove = ({ x, y, ...other }) => {
    updatePreview({ x, y });
    throttledDragAction({ x, y, ...other });
  };

  const onDragEnd = (movement) => {
    cleanupPreview();
    setIsDragging(false);

    store.dispatch(
      actions.dragEnd(movement),
    );
  };

  useEffect(() => {
    if (node.current && allowDrag) {
      dragManager = new DragManager({
        el: node.current,
        onDragStart,
        onDragMove,
        onDragEnd,
        scrollDirection,
      });
    }

    return () => {
      cleanupPreview();
      cleanupDragManager();
    };
  }, [node, allowDrag]);

  const styles = () => (isDragging ? { visibility: 'hidden' } : {});

  return (
    <div style={styles()} className={`draggable ${!allowDrag ? 'draggable--disabled' : ''}`} ref={node}>
      <WrappedComponent
        {...rest}
        allowDrag={allowDrag}
        scrollDirection={scrollDirection}
      />
      {preview && (
        <div
          ref={previewRef}
          style={{
            display: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          {preview}
        </div>
      )}
    </div>
  );
};

export default dragSource;
