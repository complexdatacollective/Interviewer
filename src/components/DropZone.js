import React from 'react';
import PropTypes from 'prop-types';

import { DropTarget } from '../behaviours/DragAndDrop';

/**
  * Renders a container onto which a `draggable` can be dropped.
  */
const DropZone = ({ children }) => (
  <div className="drop-zone">
    {children}
  </div>
);

DropZone.propTypes = {
  children: PropTypes.any,
};

DropZone.defaultProps = {
  children: null,
};

export default DropTarget(DropZone);
