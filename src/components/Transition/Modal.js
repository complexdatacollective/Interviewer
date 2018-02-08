import React from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';
import { animation } from 'network-canvas-ui';

const duration = {
  enter: animation.duration.fast * 1000,
  exit: animation.duration.fast,
};

const Modal = ({ children, ...props }) => (
  <CSSTransition
    {...props}
    timeout={duration}
    classNames="transition--window"
    appear
    unmountOnExit
  >
    { children }
  </CSSTransition>
);

Modal.propTypes = {
  children: PropTypes.any.isRequired,
};

Modal.defaultProps = {
  children: null,
};

export default Modal;
