/* eslint-disable jsx-a11y/no-static-element-interactions */

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Button, Icon } from '../ui/components';
import { Modal as ModalTransition } from '../components/Transition';

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

  const cancelButton = hasCancelButton ?
    <Button color="navy-taupe" onClick={onCancel} content={cancelLabel} /> :
    null;

  const typeColor = {
    info: 'primary',
    warning: 'mustard',
    error: 'neon-coral',
  };

  const dialogClasses = cx(`legacy-dialog__window legacy-dialog__window--${type}`);

  return (
    <ModalTransition in={show}>
      <div key="dialog" className="legacy-dialog">
        <div className="legacy-dialog__background" transition-role="background" />
        <div className={dialogClasses} transition-role="window" onClick={e => e.stopPropagation()}>
          <div className="legacy-dialog__main">
            <div className="legacy-dialog__main-icon">
              <Icon name={type} />
            </div>
            <div className="legacy-dialog__main-content">
              <h2 className="legacy-dialog__main-title">{title}</h2>
              {children}
            </div>
          </div>
          { additionalInformation &&
            <div className="legacy-dialog__additional-content">
              <div className="legacy-dialog__additional-box">
                {additionalInformation}
              </div>
            </div>
          }
          <footer className="legacy-dialog__footer">
            { cancelButton }
            <Button onClick={onConfirm} color={typeColor[type]} content={confirmLabel} />
          </footer>
        </div>
      </div>
    </ModalTransition>
  );
};

Dialog.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.any,
  show: PropTypes.bool,
  type: PropTypes.string.isRequired,
  hasCancelButton: PropTypes.bool,
  confirmLabel: PropTypes.string.isRequired,
  additionalInformation: PropTypes.node,
  cancelLabel: PropTypes.string,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func.isRequired,
};

Dialog.defaultProps = {
  children: null,
  additionalInformation: null,
  show: false,
  onCancel: () => {},
  hasCancelButton: false,
  cancelLabel: '',
};

export default Dialog;
