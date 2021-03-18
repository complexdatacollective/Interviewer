import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import cx from 'classnames';
import 'swiper/css/swiper.css';
import { actionCreators as deviceSettingsActions } from '../ducks/modules/deviceSettings';
import '../styles/main.scss';
import {
  isElectron, isCordova, isWindows, isMacOS, isLinux, isPreview, getEnv, isIOS, isAndroid,
} from '../utils/Environment';
import DialogManager from '../components/DialogManager';
import ToastManager from '../components/ToastManager';
import { SettingsMenu } from '../components/SettingsMenu';
import useUpdater from '../hooks/useUpdater';

const getElectronWindow = () => {
  if (isElectron()) {
    const electron = window.require('electron'); // eslint-disable-line global-require
    return electron.remote.getCurrentWindow();
  }
  return false;
};

/**
  * Main app container.
  * @param props {object} - children
  */
const App = ({
  startFullScreen,
  setStartFullScreen,
  interfaceScale,
  useDynamicScaling,
  children,
}) => {
  const win = getElectronWindow();
  const env = getEnv();

  const setFontSize = () => {
    const root = document.documentElement;
    const newFontSize = useDynamicScaling
      ? `${(1.65 * interfaceScale) / 100}vmin`
      : `${(16 * interfaceScale) / 100}px`;

    root.style.setProperty('--base-font-size', newFontSize);
  };

  useUpdater('https://api.github.com/repos/complexdatacollective/Interviewer/releases/latest', 2500);

  useEffect(() => {
    if (isCordova()) {
      // Enable viewport shrinking on iOS to mirror behaviour on android.
      window.Keyboard.shrinkView(true);
    }

    if (!env.REACT_APP_NO_FULLSCREEN) {
      // Spy on window fullscreen status
      if (isElectron() && !isPreview()) {
        win.setFullScreen(!!startFullScreen);

        win.on('enter-full-screen', () => {
          setStartFullScreen(true);
        });

        win.on('leave-full-screen', () => {
          setStartFullScreen(false);
        });
      }
    }

    return () => {
      if (win) {
        win.removeAllListeners();
      }
    };
  }, [win]);

  setFontSize();

  const list = {
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
      },
    },
    hidden: {
      opacity: 0,
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={list}
      className={cx({
        app: true,
        'app--electron': isElectron(),
        'app--windows': isWindows(),
        // eslint-disable-next-line @codaco/spellcheck/spell-checker
        'app--macos': isMacOS(),
        // eslint-disable-next-line @codaco/spellcheck/spell-checker
        'app--ios': isIOS(),
        'app-android': isAndroid(),
        'app--linux': isLinux(),
        'app--preview': isPreview(),
      })}
    >
      <div className="electron-titlebar" />
      <div
        id="page-wrap"
        className={cx({
          app__content: true,
        })}
      >
        <SettingsMenu />
        { children }
      </div>
      <DialogManager />
      <ToastManager />
    </motion.div>
  );
};

App.propTypes = {
  children: PropTypes.any,
  interfaceScale: PropTypes.number.isRequired,
  useDynamicScaling: PropTypes.bool.isRequired,
  startFullScreen: PropTypes.bool.isRequired,
  setStartFullScreen: PropTypes.func.isRequired,
};

App.defaultProps = {
  children: null,
};

const mapDispatchToProps = (dispatch) => ({
  setStartFullScreen: (value) => dispatch(deviceSettingsActions.setSetting('startFullScreen', value)),
});

function mapStateToProps(state) {
  return {
    interfaceScale: state.deviceSettings.interfaceScale,
    useDynamicScaling: state.deviceSettings.useDynamicScaling,
    startFullScreen: state.deviceSettings.startFullScreen,
  };
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(App);
