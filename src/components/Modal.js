/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import modal from '../behaviours/modal';
import { Modal as ModalTransition } from '../components/Transition';

/**
  * Renders a modal window.
  */
function Modal(props) {
  const {
    children,
    className,
    close,
    show,
    title,
  } = props;

  const classnames = cx('modal', className);

  return (
    <ModalTransition in={show}>
      <div key="modal" className={classnames} onClick={() => close()}>
        <div className="modal__window" onClick={e => e.stopPropagation()}>
          <div className="modal__layout">
            <div className="modal__layout-title">
              <h1>{title}</h1>
            </div>
            <div className="modal__layout-content">
              {children}
            </div>
          </div>
          <button className="modal__close" onClick={() => close()}>
            Cancel
          </button>
        </div>
      </div>
    </ModalTransition>
  );
}

Modal.propTypes = {
  className: PropTypes.string,
  close: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  show: PropTypes.bool,
  children: PropTypes.any,
};

Modal.defaultProps = {
  className: '',
  show: false,
  children: null,
};

export default modal(Modal);
