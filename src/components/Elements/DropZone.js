import React from 'react';

import droppable from '../../behaviors/droppable';

/**
  * Renders a container onto which a `draggable` can be dropped.
  */
const DropZone = () => <div className="drop-zone" />;

export default droppable(DropZone);
