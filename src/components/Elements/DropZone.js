import React from 'react';

import { droppable } from '../../behaviours';

/**
  * Renders a container onto which a `draggable` can be dropped.
  */
const DropZone = () => <div className="drop-zone" />;

export default droppable(DropZone);
