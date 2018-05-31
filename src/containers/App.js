import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router';
import cx from 'classnames';
import '../styles/main.scss';
import { settingsMenuIsOpen, stageMenuIsOpen } from '../selectors/session';
import { isElectron, isWindows, isMacOS, isLinux } from '../utils/Environment';
import { SettingsMenu, StageMenu, LoadScreen } from '../containers';
import { ErrorMessage } from '../components';

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
    'app--settings-open': props.isSettingsMenuOpen,
  })}
  >
    <div className="electron-titlebar" />
    <SettingsMenu hideButton={props.isMenuOpen} />
    <StageMenu hideButton={props.isMenuOpen} />
    <div
      id="page-wrap"
      className={cx({
        app__content: true,
        'app__content--pushed': props.isMenuOpen,
      })}
    >
      { props.children }
    </div>
    <LoadScreen />
    <ErrorMessage />
  </div>

);

App.propTypes = {
  children: PropTypes.any,
  isMenuOpen: PropTypes.bool,
  isSettingsMenuOpen: PropTypes.bool,
};

App.defaultProps = {
  children: null,
  isMenuOpen: false,
  isSettingsMenuOpen: false,
};

function mapStateToProps(state) {
  return {
    isMenuOpen: settingsMenuIsOpen(state) || stageMenuIsOpen(state),
    isSettingsMenuOpen: settingsMenuIsOpen(state),
  };
}

export default compose(
  withRouter,
  connect(mapStateToProps),
)(App);
