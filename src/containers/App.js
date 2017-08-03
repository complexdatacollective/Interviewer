import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cx from 'classnames';
import { remote } from 'electron';
import { sessionMenuIsOpen, stageMenuIsOpen } from '../selectors/session';
import { SessionMenu, StageMenu } from '.';
import { isElectron } from '../utils/Environment';

require('../styles/main.scss');

const getVersion = () => {
  if (isElectron()) {
    // const app = remote.app;  // eslint-disable-line global-require
    const version = remote.app.getVersion();
    console.log('VERSION', version);
    return version;
  }

  // TODO: Cordova?

  return '0.0.0';
};

/**
  * Main app container.
  * @param props {object} - children
  */
class App extends Component {

  constructor() {
    super();

    this.state = {
      version: '0.0.0',
    };

    setTimeout(() => {
      this.setState({
        version: getVersion(),
      });
    }, 1000);
  }

  render() {
    const { isSessionMenu, isMenuOpen, children } = this.props;
    const { version } = this.state;

    return (
      <div className={cx({
        app: true,
        'app--session': isSessionMenu,
      })}
      >
        <div style={{ position: 'absolute', top: 0, right: 0, display: 'inline', padding: '10px', zIndex: 1000 }}>{ version }</div>
        <SessionMenu hideButton={isMenuOpen} />
        <StageMenu hideButton={isMenuOpen} />
        <div
          id="page-wrap"
          className={cx({
            app__content: true,
            'app__content--pushed': isMenuOpen,
          })}
        >
          { children }
        </div>
      </div>
    );
  }
}

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

export default connect(mapStateToProps)(App);
