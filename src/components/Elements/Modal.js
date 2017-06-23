/* eslint-disable */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { CSSTransitionGroup } from 'react-transition-group';
import PropTypes from 'prop-types';
import styles from '../../ui/styles';

/**
  * Renders a modal window.
  */
const Modal = (props) => {
  const {
    show,
    children,
    title,
    onClose,
  } = props;

  return (
    <CSSTransitionGroup
     transitionName="modal--transition"
     transitionEnterTimeout={styles.animation.duration.standard}
     transitionLeaveTimeout={styles.animation.duration.standard}
    >
      { show &&
        <div key="modal" className="modal" onClick={onClose}>
          <div className="modal__window" onClick={e => e.stopPropagation()}>
            <div className="modal__layout">
              <div className="modal__layout-title">
                <h1>{title}</h1>
              </div>
              <div className="modal__layout-content">
                {children}
              </div>
            </div>
            <button className="modal__close" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      }
    </CSSTransitionGroup>
  );
};

Modal.propTypes = {
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  show: PropTypes.bool,
  children: PropTypes.any,
};

Modal.defaultProps = {
  show: false,
  children: null,
};

export default Modal;
