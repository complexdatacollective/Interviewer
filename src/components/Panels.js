import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

/**
  * Renders a pane container.
  */
const Panels = ({ children, minimise }) => {
  const panelsClasses = cx(
    'panels',
    { 'panels--minimise': minimise },
  );
  return (
    <div className={panelsClasses}>
      { children }
    </div>
  );
};

Panels.propTypes = {
  children: PropTypes.any,
  minimise: PropTypes.bool,
};

Panels.defaultProps = {
  children: null,
  minimise: false,
};

export default Panels;
