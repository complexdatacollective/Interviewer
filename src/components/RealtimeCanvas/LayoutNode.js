import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import UINode from '../../containers/Node';
import DragManager from '../../behaviours/DragAndDrop/DragManager';

const LayoutNode = ({
  portal,
  onDragStart,
  onDragMove,
  onDragEnd,
  index,
  ...props
}) => {
  const dragManager = useRef();

  useEffect(() => {
    dragManager.current = new DragManager({
      el: portal,
      onDragStart: (data) => onDragStart(index, data),
      onDragMove: (data) => onDragMove(index, data),
      onDragEnd: (data) => onDragEnd(index, data),
    });

    return () => {
      dragManager.current.unmount();
    };
  }, [portal]);

  return ReactDOM.createPortal(
    <UINode {...props} />,
    portal,
  );
};

export default LayoutNode;
