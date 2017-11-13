import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { droppable } from '../../behaviours';

/**
  * Renders a container onto which a `draggable` can be dropped.
  */
const DropZone = ({ children, hover }) => (
  <div className="drop-zone">
    {React.Children.map(
      children,
      (child => React.cloneElement(child, { className: cx(child.props.className, { hover }) })))}
  </div>
);

DropZone.propTypes = {
  children: PropTypes.any,
  hover: PropTypes.bool,
};

DropZone.defaultProps = {
  children: null,
  hover: false,
};

export default droppable(DropZone);
