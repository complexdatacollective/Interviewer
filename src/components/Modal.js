import React, { Component } from 'react';
import animejs from 'animejs';
import cx from 'classnames';
import PropTypes from 'prop-types';
import modal from '../behaviours/modal';
import { Modal as ModalTransition } from '../components/Transition';
import { getCSSVariableAsNumber, getCSSVariableAsObject } from '../utils/CSSVariables';

/**
  * Renders a modal window.
  */
class Modal extends Component {
  constructor(props) {
    super(props);
    this.contentRef = React.createRef();
  }

  scrollContentsToTop() {
    if (this.contentRef.current) {
      animejs({
        targets: this.contentRef.current,
        scrollTop: 0,
        duration: getCSSVariableAsNumber('--animation-duration-slow-ms'),
        easing: getCSSVariableAsObject('--animation-easing-js'),
      });
    }
  }

  render() {
    const {
      children,
      className,
      close,
      show,
      title,
    } = this.props;

    const classnames = cx('modal', className);

    return (
      <ModalTransition in={show}>
        <div key="modal" className={classnames} onClick={() => close()}>
          <div className="modal__background" transition-role="background" />
          <div className="modal__window" transition-role="window" onClick={e => e.stopPropagation()}>
            <div className="modal__layout">
              <div className="modal__layout-title">
                <h1>{title}</h1>
              </div>
              <div className="modal__layout-content" ref={this.contentRef}>
                {children}
              </div>
            </div>
            <button className="modal__close" onClick={() => close()} />
          </div>
        </div>
      </ModalTransition>
    );
  }
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
