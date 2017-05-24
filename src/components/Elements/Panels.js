import React from 'react';
import PropTypes from 'prop-types';

/**
  * Renders a pane container.
  */
const Panels = props => (
  <div className="panels">
    { props.children }
  </div>
);

Panels.propTypes = {
  children: PropTypes.any,
};

Panels.defaultProps = {
  children: null,
};

export default Panels;
