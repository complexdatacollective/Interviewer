import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
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
import { actionCreators as dialogActions } from '../ducks/modules/dialogs';

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
  children,
}) => {

  const interfaceScale = useSelector(state => state.deviceSettings.interfaceScale);
  const useDynamicScaling = useSelector(state => state.deviceSettings.useDynamicScaling);

  const setFontSize = useCallback(() => {
    const root = document.documentElement;
    const newFontSize = useDynamicScaling
      ? `${(1.65 * interfaceScale) / 100}vmin`
      : `${(16 * interfaceScale) / 100}px`;

    root.style.setProperty('--base-font-size', newFontSize);
  }, [useDynamicScaling, interfaceScale]);

  useUpdater('https://api.github.com/repos/complexdatacollective/Interviewer/releases/latest', 2500);

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
        'app--macos': isMacOS(),
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
};

App.defaultProps = {
  children: null,
};

export default App;
