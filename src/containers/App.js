import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import cx from 'classnames';
import { sessionMenuIsOpen, stageMenuIsOpen } from '../selectors/session';
import { isElectron, isWindows, isMacOS, isLinux } from '../utils/Environment';
import { SessionMenu, StageMenu, LoadScreen } from '../containers';
import { ErrorMessage } from '../components';
import serverDiscoverer from '../utils/serverDiscovery';

require('../styles/main.scss');


console.log(serverDiscoverer);

const serverDiscovery = serverDiscoverer();

console.log(serverDiscovery);

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
    'app--session': props.isSessionMenu,
  })}
  >
    <div className="electron-titlebar" />
    <SessionMenu hideButton={props.isMenuOpen} />
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
  isSessionMenu: PropTypes.bool,
};

App.defaultProps = {
  children: null,
  isMenuOpen: false,
  isSessionMenu: false,
};

function mapStateToProps(state) {
  return {
    isMenuOpen: sessionMenuIsOpen(state) || stageMenuIsOpen(state),
    isSessionMenu: sessionMenuIsOpen(state),
  };
}

export default compose(
  connect(mapStateToProps),
)(App);
