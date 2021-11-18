import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import UINode from '../../containers/Node';
import DragManager from '../../behaviours/DragAndDrop/DragManager';

const LayoutNode = ({
  node,
  portal,
  onSelected,
  onDragStart,
  onDragMove,
  onDragEnd,
  allowPositioning,
  selected,
  linking,
  index,
  ...props
}) => {
  const dragManager = useRef();

  useEffect(() => {
    if (portal && allowPositioning) {
      dragManager.current = new DragManager({
        el: portal,
        onDragStart: (data) => onDragStart(index, data),
        onDragMove: (data) => onDragMove(index, data),
        onDragEnd: (data) => onDragEnd(index, data),
      });
    }

    return () => {
      if (dragManager.current) {
        dragManager.current.unmount();
      }
    };
  }, [portal, index]);

  useEffect(() => {
    console.log('ran me');
    const handleSelected = () => onSelected(node);

    portal.addEventListener('click', handleSelected);

    return () => { portal.removeEventListener('click', handleSelected); };
  }, [onSelected, node]);

  return ReactDOM.createPortal(
    <UINode
      {...node}
      selected={selected}
      linking={linking}
    />,
    portal,
  );
};

export default LayoutNode;
