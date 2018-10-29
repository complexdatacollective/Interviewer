import React, { Component } from 'react';
import animejs from 'animejs';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { Modal } from '../ui/components';
import { getCSSVariableAsNumber, getCSSVariableAsObject } from '../utils/CSSVariables';
import isLarge from '../utils/isLarge';

/**
  * Renders a modal window.
  */
class Overlay extends Component {
  constructor(props) {
    super(props);
    this.contentRef = React.createRef();
  }

  scrollContentsToTop = () => {
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
      onClose,
      onBlur,
      show,
      title,
    } = this.props;

    return (
      <Modal show={show} onBlur={onBlur}>
        <div className={cx('overlay', { 'overlay--fullscreen': !isLarge() })}>
          <div className="overlay__title">
            <h1>{title}</h1>
          </div>
          <div className="overlay__content" ref={this.contentRef}>
            {children}
          </div>
          <button className="overlay__close" onClick={onClose} />
        </div>
      </Modal>
    );
  }
}

Overlay.propTypes = {
  onClose: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  title: PropTypes.string.isRequired,
  show: PropTypes.bool,
  children: PropTypes.any,
};

Overlay.defaultProps = {
  onBlur: () => {},
  className: '',
  show: false,
  children: null,
};

export default Overlay;
