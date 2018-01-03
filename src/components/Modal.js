/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { CSSTransitionGroup } from 'react-transition-group';
import cx from 'classnames';
import { animation } from 'network-canvas-ui';
import PropTypes from 'prop-types';
import modal from '../behaviours/modal';

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

  if (!show) { return null; }

  return (
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
