import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import cx from 'classnames';

import '../styles/main.scss';
import { isElectron, isWindows, isMacOS, isLinux } from '../utils/Environment';
import { LoadScreen } from '../containers';
import { ErrorMessage } from '../components';
import DialogManager from '../components/DialogManager';
import MainMenu from '../containers/MainMenu';

/**
  * Main app container.
  * @param props {object} - children
  */
class App extends PureComponent {
  componentDidMount() {
    this.setFontSize();
  }

  componentDidUpdate() {
    this.setFontSize();
  }

  setFontSize = () => {
    const newFontSize = (1.75 * this.props.interfaceScale) / 100;
    const root = document.documentElement;
    root.style.setProperty('--base-font-size', `${newFontSize}vmin`);
  }

  render() {
    const { children } = this.props;
    return (
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
          { children }
        </div>
        <LoadScreen />
        <DialogManager />
        <ErrorMessage />
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.any,
  interfaceScale: PropTypes.number.isRequired,
};

App.defaultProps = {
  children: null,
};

const mapStateToProps = state => ({
  interfaceScale: state.deviceSettings.interfaceScale,
});

export default compose(
  withRouter,
  connect(mapStateToProps),
)(App);
