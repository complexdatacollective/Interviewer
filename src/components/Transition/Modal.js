import React from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';
import { getCSSVariableAsNumber } from '../../utils/CSSVariables';

const duration = {
  enter: getCSSVariableAsNumber('--animation-duration-standard-ms'),
  exit: getCSSVariableAsNumber('--animation-duration-standard-ms'),
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
