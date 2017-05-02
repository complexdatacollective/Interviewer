import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Modal extends Component {

  render() {
    const {
      show,
      children,
      onClose
    } = this.props;

    if (!show) {
      return null;
    }

    return (
      <div className="modal" onClick={ onClose }>
        <div className="modal__window" onClick={ (e) => e.stopPropagation() }>
          { children }

          <button onClick={ onClose }>
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
