/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { CSSTransitionGroup } from 'react-transition-group';
import { Icon, animation } from 'network-canvas-ui';
import PropTypes from 'prop-types';
import modal from '../../behaviours/modal';

/**
  * Renders a modal window.
  */
function Modal(props) {
  const {
    children,
    close,
    show,
    title,
  } = props;

  return (
    <CSSTransitionGroup
      transitionName="modal--transition"
      transitionEnterTimeout={animation.duration.standard}
      transitionLeaveTimeout={animation.duration.standard}
    >
      { show &&
        <div key="modal" className="modal" onClick={() => close()}>
          <div className="modal__window" onClick={e => e.stopPropagation()}>
            <Icon name="form-arrow-left" />
            <div className="modal__layout">
              <div className="modal__layout-title">
                <h1>{title}</h1>
              </div>
              <div className="modal__layout-content">
                {children}
              </div>
            </div>
            <Icon name="form-arrow-right" />
            <button className="modal__close" onClick={() => close()}>
              Cancel
            </button>
          </div>
        </div>
      }
    </CSSTransitionGroup>
  );
}

Modal.propTypes = {
  close: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  show: PropTypes.bool,
  children: PropTypes.any,
};

Modal.defaultProps = {
  show: false,
  children: null,
};

export default modal(Modal);
