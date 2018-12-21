import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

/**
 * Wrapper component for consistent positioning between canvas modules
 */
const Canvas = ({ children, className }) => (
  <div className={cx('canvas', className)}>
    {children}
  </div>
);

Canvas.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

Canvas.defaultProps = {
  children: null,
  className: null,
};

export default Canvas;
