import React from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';
import getCSSVariable from '../../utils/CSSVariables';

const duration = {
  enter: parseInt(getCSSVariable('--animation-duration-fast-ms'), 10),
  exit: parseInt(getCSSVariable('--animation-duration-fast-ms'), 10),
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
