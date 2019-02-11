import React from 'react';
import cx from 'classnames';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Modal } from '../ui/components';

/**
 * Renders a modal window.
 */
const Overlay = ({
  children,
  onClose,
  onBlur,
  show,
  title,
  useFullScreenForms,
}) => (
  <Modal show={show} onBlur={onBlur}>
    <div className={cx('overlay', { 'overlay--fullscreen': useFullScreenForms })}>
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

Overlay.propTypes = {
  onClose: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  title: PropTypes.string.isRequired,
  show: PropTypes.bool,
  children: PropTypes.any,
  useFullScreenForms: PropTypes.bool.isRequired,
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
