import React from 'react';
import { DropZone } from '../../components/Elements';

const NodeLayout = () => (
  <DropZone droppableName="NODE_LAYOUT" acceptsDraggableType="NODE_BUCKET">
    <div className="node-layout" />
  </DropZone>
);

export default NodeLayout;
