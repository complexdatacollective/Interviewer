/* eslint-disable */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { CSSTransitionGroup } from 'react-transition-group';
import { animation } from 'network-canvas-ui';
import PropTypes from 'prop-types';

/**
  * Renders a dialog box.
  */
const Dialog = (props) => {
  const {
    show,
    children,
    title,
    onClose,
  } = props;

  return (
    <CSSTransitionGroup
     transitionName="dialog--transition"
     transitionEnterTimeout={animation.duration.standard}
     transitionLeaveTimeout={animation.duration.standard}
    >
      { show &&
        <div key="dialog" className="dialog" onClick={onClose}>
          <div className="dialog__window" onClick={e => e.stopPropagation()}>
            <div className="dialog__layout">
              <div className="dialog__layout-title">
                <h1>{title}</h1>
              </div>
              <div className="dialog__layout-content">
                {children}
              </div>
            </div>
            <button className="dialog__close" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      }
    </CSSTransitionGroup>
  );
};

Dialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  show: PropTypes.bool,
  children: PropTypes.any,
};

Dialog.defaultProps = {
  show: false,
  children: null,
};

export default Dialog;
