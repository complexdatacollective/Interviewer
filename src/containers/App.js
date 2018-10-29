import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { withRouter } from 'react-router';
import cx from 'classnames';

import '../styles/main.scss';
import { isElectron, isWindows, isMacOS, isLinux } from '../utils/Environment';
import { LoadScreen } from '../containers';
import DialogManager from '../components/DialogManager';
import MainMenu from '../containers/MainMenu';

/**
  * Main app container.
  * @param props {object} - children
  */
const App = props => (
  <div className={cx({
    app: true,
    'app--electron': isElectron(),
    'app--windows': isWindows(),
    'app--macos': isMacOS(),
    'app--linux': isLinux(),
  })}
  >
    <MainMenu />
    <div className="electron-titlebar" />
    <div
      id="page-wrap"
      className={cx({
        app__content: true,
      })}
    >
      { props.children }
    </div>
    <LoadScreen />
    <DialogManager />
  </div>

);

App.propTypes = {
  children: PropTypes.any,
};

App.defaultProps = {
  children: null,
  isSettingsMenuOpen: false,
};

export default compose(
  withRouter,
)(App);
