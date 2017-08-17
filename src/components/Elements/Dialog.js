/* eslint-disable */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, animation } from 'network-canvas-ui';
import { CSSTransitionGroup } from 'react-transition-group';

/**
  * Renders a dialog box.
  */
const Dialog = (props) => {
  const {
    title,
    children,
    show,
    showCancelButton,
    onCancel,
    onConfirm,
    type,
  } = props;

  let cancelButton = null;
  if (showCancelButton) {
    cancelButton = <Button color="navy-taupe" onClick={onCancel} icon={<Icon name="close" />} > Cancel</Button>;
  }

  return (
    <CSSTransitionGroup
      transitionName="dialog--transition"
      transitionEnterTimeout={animation.duration.standard}
      transitionLeaveTimeout={animation.duration.standard}
    >
      { show &&
        <div key="dialog" className="dialog" onClick={onCancel}>
          <div className="dialog__window" onClick={e => e.stopPropagation()}>
            <div className="dialog__layout">
              <div className="dialog__layout-icon">
                <Icon name="info" />
              </div>
              <div className="dialog__layout-content">
                <h2 className="dialog__layout-title">{title}</h2>
                {children}
              </div>
            </div>
            <footer className="dialog__footer">
              { cancelButton }
              <Button onClick={onConfirm} content="Confirm" />
            </footer>
          </div>
        </div>
      }
    </CSSTransitionGroup>
  );
};

Dialog.propTypes = {
  title: PropTypes.string,
  children: PropTypes.any,
  show: PropTypes.bool,
  showCancelButton: PropTypes.bool,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
};

Dialog.defaultProps = {
  title: 'This is my dialog title',
  children: null,
  show: true,
  showCancelButton: true,
  onCancel: {},
  onConfirm: {},
};

export default Dialog;
