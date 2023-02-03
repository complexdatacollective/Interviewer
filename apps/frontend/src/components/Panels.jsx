import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

/**
  * Renders a pane container.
  */
const Panels = ({ children, minimize }) => {
  const panelsClasses = cx(
    'panels',
    { 'panels--minimize': minimize },
  );
  return (
    <div className={panelsClasses}>
      { children }
    </div>
  );
};

Panels.propTypes = {
  children: PropTypes.any,
  minimize: PropTypes.bool,
};

Panels.defaultProps = {
  children: null,
  minimize: false,
};

export default Panels;
