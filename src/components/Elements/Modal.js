import React, { Component } from 'react';

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
  onClose: React.PropTypes.func.isRequired,
  show: React.PropTypes.bool,
  children: React.PropTypes.node
};

export default Modal;
