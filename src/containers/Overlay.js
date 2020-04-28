import React from 'react';
import cx from 'classnames';
import anime from 'animejs';
import PropTypes from 'prop-types';
import { Modal } from '@codaco/ui';
import { getCSSVariableAsNumber, getCSSVariableAsObject } from '@codaco/ui/lib/utils/CSSVariables';
import { CloseButton } from '../components';

/**
 * Renders a modal window.
 */

class Overlay extends React.Component {
  constructor(props) {
    super(props);
    this.contentRef = React.createRef();
  }

  scrollContentsToTop = () => {
    if (this.contentRef.current) {
      anime({
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
      className,
    } = this.props;

    return (
      <Modal show={show} onBlur={onBlur}>
        <div className={cx('overlay', className)}>
          { title && (
            <div className="overlay__title">
              <h1>{title}</h1>
              <CloseButton className="overlay__close" onClick={onClose} />
            </div>
          )}
          <div className="overlay__content" ref={this.contentRef}>
            {children}
          </div>
        </div>
      </Modal>
    );
  }
}

Overlay.propTypes = {
  onClose: PropTypes.func,
  onBlur: PropTypes.func,
  title: PropTypes.string,
  show: PropTypes.bool,
  children: PropTypes.any,
  className: PropTypes.string,
};

Overlay.defaultProps = {
  onBlur: () => {},
  onClose: () => {},
  title: null,
  className: '',
  show: false,
  children: null,
};

export {
  Overlay,
};

export default Overlay;
