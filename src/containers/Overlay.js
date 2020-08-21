import React from 'react';
import cx from 'classnames';
import { connect } from 'react-redux';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { Modal } from '@codaco/ui';
import { CloseButton } from '../components';

/**
 * Renders a modal window.
 */

const Overlay = (props) => {
  const {
    children,
    onClose,
    onBlur,
    show,
    title,
    useFullScreenForms,
    forceDisableFullScreen,
    className,
  } = props;

  return (
    <Modal show={show} onBlur={onBlur}>
      <motion.div layout className={cx('overlay', { 'overlay--fullscreen': !forceDisableFullScreen && useFullScreenForms }, className)}>
        { title && (
          <div className="overlay__title">
            <h1>{title}</h1>
          </div>
        )}
        <motion.div layout className="overlay__content">
          {children}
        </motion.div>
        <CloseButton className="overlay__close" onClick={onClose} />
      </motion.div>
    </Modal>
  );
};

Overlay.propTypes = {
  onClose: PropTypes.func,
  onBlur: PropTypes.func,
  title: PropTypes.string,
  show: PropTypes.bool,
  children: PropTypes.any,
  useFullScreenForms: PropTypes.bool,
  forceDisableFullScreen: PropTypes.bool,
  className: PropTypes.string,
};

Overlay.defaultProps = {
  onBlur: () => {},
  onClose: () => {},
  title: null,
  className: '',
  show: false,
  children: null,
  forceDisableFullScreen: false,
  useFullScreenForms: false,
};

export {
  Overlay,
};

const mapStateToProps = state =>
  ({ useFullScreenForms: state.deviceSettings.useFullScreenForms });

export default connect(mapStateToProps)(Overlay);
