import React from 'react';
import cx from 'classnames';
import { motion } from 'framer-motion';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Modal } from '@codaco/ui';
import CloseButton from '../components/CloseButton';

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
    footer,
    fullheight,
    fullscreen,
    useFullScreenForms,
    forceDisableFullScreen,
    className,
  } = props;

  if (!show) { return false; }

  const overlayClasses = cx(
    'overlay',
    // eslint-disable-next-line @codaco/spellcheck/spell-checker
    { 'overlay--fullheight': fullheight },
    { 'overlay--fullscreen': !forceDisableFullScreen && useFullScreenForms },
    { 'overlay--fullscreen': fullscreen },
    className,
  );

  return (
    <Modal show={show} onBlur={onBlur}>
      <motion.article className={overlayClasses} layout>
        { title && (
          <header className="overlay__title">
            <h1>{title}</h1>
            <CloseButton className="overlay__close" onClick={onClose} />
          </header>
        )}
        <motion.main className="overlay__content">
          {children}
        </motion.main>
        { footer && (
          <motion.footer className="overlay__footer">
            {footer}
          </motion.footer>
        )}
      </motion.article>
    </Modal>
  );
};

Overlay.propTypes = {
  onClose: PropTypes.func,
  onBlur: PropTypes.func,
  title: PropTypes.string,
  show: PropTypes.bool,
  children: PropTypes.any,
  footer: PropTypes.any,
  useFullScreenForms: PropTypes.bool,
  fullheight: PropTypes.bool,
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
  footer: null,
  fullheight: false,
  forceDisableFullScreen: false,
  useFullScreenForms: false,
};

export {
  Overlay,
};

const mapStateToProps = (state) => ({
  useFullScreenForms: state.deviceSettings.useFullScreenForms,
});

export default connect(mapStateToProps)(Overlay);
