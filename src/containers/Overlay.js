import React from 'react';
import cx from 'classnames';
import anime from 'animejs';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Modal } from '../ui/components';
import { getCSSVariableAsNumber, getCSSVariableAsObject } from '../ui/utils/CSSVariables';

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
      useFullScreenForms,
      className,
    } = this.props;

    return (
      <Modal show={show} onBlur={onBlur}>
        <div className={cx('overlay', { 'overlay--fullscreen': useFullScreenForms }, className)}>
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
  useFullScreenForms: PropTypes.bool.isRequired,
  className: PropTypes.string,
};

Overlay.defaultProps = {
  onBlur: () => {},
  className: '',
  show: false,
  children: null,
};

export {
  Overlay,
};

const mapStateToProps = state =>
  ({ useFullScreenForms: state.deviceSettings.useFullScreenForms });

export default connect(mapStateToProps, null, null, { withRef: true })(Overlay);
