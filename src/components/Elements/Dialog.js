/* eslint-disable */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Button, Icon, animation } from 'network-canvas-ui';
import { CSSTransitionGroup } from 'react-transition-group';
import xss from 'xss';

/**
  * Renders a dialog box.
  */
const Dialog = (props) => {
  const {
    title,
    children,
    show,
    hasCancelButton,
    additionalInformation,
    cancelLabel,
    confirmLabel,
    onCancel,
    onConfirm,
    type,
  } = props;

  let cancelButton = null;
  if (hasCancelButton) {
    cancelButton = <Button color="navy-taupe" onClick={onCancel} content={cancelLabel} />;
  }

  const typeColor = {
    'info': 'primary',
    'warning': 'mustard',
    'error': 'neon-coral',
  }

  function createMarkup() {
    const safeString = xss(additionalInformation, {
      whiteList: {
        h3: [],
        p: [],
        ul: [],
        li: [],
      },
      stripIgnoreTag: true,
    });
    return {
      __html: safeString
    };
  };


  let dialogClasses  = cx('dialog__window dialog__window--' + type);
  let additionalTextarea = additionalInformation ? <div className="dialog__additional-box" dangerouslySetInnerHTML={createMarkup()} />: '';

  return (
    <CSSTransitionGroup
      transitionName="dialog--transition"
      transitionEnterTimeout={animation.duration.standard}
      transitionLeaveTimeout={animation.duration.standard}
    >
      { show &&
        <div key="dialog" className="dialog">
          <div className={dialogClasses} onClick={e => e.stopPropagation()}>
            <div className="dialog__main">
              <div className="dialog__main-icon">
                <Icon name={type} />
              </div>
              <div className="dialog__main-content">
                <h2 className="dialog__main-title">{title}</h2>
                {children}
              </div>
            </div>
            <div className="dialog__additional-content">
              {additionalTextarea}
            </div>
            <footer className="dialog__footer">
              { cancelButton }
              <Button onClick={onConfirm} color={typeColor[type]} content={confirmLabel} />
            </footer>
          </div>
        </div>
      }
    </CSSTransitionGroup>
  );
};

Dialog.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.any,
  show: PropTypes.bool,
  type: PropTypes.string.isRequired,
  hasCancelButton: PropTypes.bool.isRequired,
  confirmLabel: PropTypes.string.isRequired,
  additionalInformation: PropTypes.string,
  cancelLabel: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

Dialog.defaultProps = {
  children: null,
  additionalInformation: null,
  show: false,
};

export default Dialog;
