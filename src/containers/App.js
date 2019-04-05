import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import cx from 'classnames';

import '../styles/main.scss';
import { isElectron, isWindows, isMacOS, isLinux } from '../utils/Environment';
import DialogManager from '../components/DialogManager';

import MainMenu from '../containers/MainMenu';
import SettingsMenuButton from '../components/MainMenu/SettingsMenuButton';

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
    const root = document.documentElement;
    const newFontSize = this.props.useDynamicScaling ?
      `${(1.75 * this.props.interfaceScale) / 100}vmin` :
      `${(18 * this.props.interfaceScale) / 100}px`;

    root.style.setProperty('--base-font-size', newFontSize);
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
        <SettingsMenuButton id="SETTINGS_MENU_OBSTACLE" />
        <div
          id="page-wrap"
          className={cx({
            app__content: true,
          })}
        >
          { children }
        </div>
        <DialogManager />
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.any,
  interfaceScale: PropTypes.number.isRequired,
  useDynamicScaling: PropTypes.bool.isRequired,
};

App.defaultProps = {
  children: null,
};

function mapStateToProps(state) {
  return {
    interfaceScale: state.deviceSettings.interfaceScale,
    useDynamicScaling: state.deviceSettings.useDynamicScaling,
  };
}

export default compose(
  withRouter,
  connect(mapStateToProps),
)(App);
