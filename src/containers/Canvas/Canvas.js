import React from 'react';
import PropTypes from 'prop-types';

/**
 * Wrapper component for consistent positioning between canvas modules
 */
const Canvas = ({ children }) => (
  <div className="canvas">
    {children}
  </div>
);

Canvas.propTypes = {
  children: PropTypes.node,
};

Canvas.defaultProps = {
  children: null,
};

export default Canvas;
