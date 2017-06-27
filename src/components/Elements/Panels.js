import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { CSSTransitionGroup } from 'react-transition-group';
import { animation } from 'network-canvas-ui';

/**
  * Renders a pane container.
  */
const Panels = ({ children, minimise }) => {
  const panelsClasses = cx(
    'panels',
    { 'panels--minimise': minimise },
  );
  return (
    <CSSTransitionGroup
      component="div"
      className={panelsClasses}
      transitionName="panel--transition"
      transitionEnterTimeout={animation.duration.standard}
      transitionLeaveTimeout={animation.duration.standard}
    >
      { children }
    </CSSTransitionGroup>
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
