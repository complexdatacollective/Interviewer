/**
 * Main app container with secure API support.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import cx from 'classnames';
import { actionCreators as deviceSettingsActions } from '../ducks/modules/deviceSettings';
import '../styles/main.scss';
import {
  isElectron, isWindows, isMacOS, isLinux, isPreview, getEnv, isIOS, isAndroid,
} from '../utils/Environment';
import DialogManager from '../components/DialogManager';
import ToastManager from '../components/ToastManager';
import { SettingsMenu } from '../components/SettingsMenu';
import useUpdater from '../hooks/useUpdater';

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
  const env = getEnv();
  const [isFullScreen, setIsFullScreen] = useState(startFullScreen);

  const setFontSize = useCallback(() => {
    const root = document.documentElement;
    const newFontSize = useDynamicScaling
      ? `${(1.65 * interfaceScale) / 100}vmin`
      : `${(16 * interfaceScale) / 100}px`;

    root.style.setProperty('--base-font-size', newFontSize);
  }, [useDynamicScaling, interfaceScale]);

  useUpdater('https://api.github.com/repos/complexdatacollective/Interviewer/releases/latest', 2500);

  useEffect(() => {
    if (!env.REACT_APP_NO_FULLSCREEN) {
      if (isElectron() && !isPreview() && window.electronAPI?.window) {
        // Set initial fullscreen state
        window.electronAPI.window.setFullScreen(!!startFullScreen);

        // Poll for fullscreen state changes
        // Note: Without electron.remote, we can't use event listeners directly
        // Instead we use a polling approach or could add IPC events for this
        const checkFullScreen = async () => {
          try {
            const currentFullScreen = await window.electronAPI.window.isFullScreen();
            if (currentFullScreen !== isFullScreen) {
              setIsFullScreen(currentFullScreen);
              setStartFullScreen(currentFullScreen);
            }
          } catch {
            // ignore errors
          }
        };

        const interval = setInterval(checkFullScreen, 1000);

        return () => {
          clearInterval(interval);
        };
      }
    }
    return undefined;
  }, [startFullScreen, setStartFullScreen, isFullScreen, env.REACT_APP_NO_FULLSCREEN]);

  setFontSize();

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
        {children}
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
