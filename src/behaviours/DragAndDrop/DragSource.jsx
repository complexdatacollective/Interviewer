import { useEffect, useCallback, useRef, useState } from 'react';
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
  let dragManager = useRef();
  let previewEl = useRef();

  const [isDragging, setIsDragging] = useState(false);

  const cleanupDragManager = useCallback(() => {
    if (dragManager.current) {
      dragManager.current.unmount();
      dragManager.current = null;
    }
  }, [dragManager]);

  const cleanupPreview = useCallback(() => {
    if (previewEl.current) {
      previewEl.current.cleanup();
      previewEl.current = null;
    }
  }, [previewEl]);

  const createPreview = useCallback(() => {
    if (!preview) {
      previewEl.current = new DragPreview(node.current);
      return;
    }

    previewEl.current = new DragPreview(previewRef.current);
  }, [preview]);

  const updatePreview = useCallback(({ x, y }) => {
    if (previewEl) {
      previewEl.current.position({ x, y });
    }
  }, [previewEl]);

  const setValidMove = (valid) => {
    if (!previewEl) return;
    previewEl.current.setValidMove(valid);
  };

  const onDragStart = useCallback((movement) => {
    createPreview();

    store.dispatch(
      actions.dragStart({
        ...movement,
        meta: meta(),
      }),
    );

    setIsDragging(true);
  }, [meta, createPreview]);

  const throttledDragAction = throttle(({ x, y, ...other }) => {
    store.dispatch(
      actions.dragMove({
        x, y, setValidMove, ...other,
      }),
    );
  }, 60);

  const onDragMove = useCallback(({ x, y, ...other }) => {
    updatePreview({ x, y });
    throttledDragAction({ x, y, ...other });
  }, [updatePreview, throttledDragAction]);

  const onDragEnd = useCallback((movement) => {
    cleanupPreview();
    setIsDragging(false);

    store.dispatch(
      actions.dragEnd(movement),
    );
  }, [cleanupPreview, setIsDragging]);

  useEffect(() => {
    if (node.current && allowDrag) {
      dragManager.current = new DragManager({
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
  }, [node, allowDrag, cleanupPreview, cleanupDragManager, onDragMove, onDragStart, onDragEnd, scrollDirection]);

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
