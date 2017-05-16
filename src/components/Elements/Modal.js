import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Modal extends Component {

  render() {
    const {
      show,
      children,
      title,
      onClose
    } = this.props;

    if (!show) {
      return null;
    }

    return (
      <div className="modal" onClick={ onClose }>
        <div className="modal__window" onClick={ (e) => e.stopPropagation() }>
          <div className="modal__layout">
            <div className="modal__layout-title">
              <h1>{ title }</h1>
            </div>
            <div className="modal__layout-content">
              { children }
            </div>
          </div>
          <button className="modal__close" onClick={ onClose }>
            Cancel
          </button>
        </div>
      </div>
    );
  }
}

Modal.propTypes = {
  onClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
  children: PropTypes.node
};

export default Modal;
