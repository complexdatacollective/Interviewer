import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import cx from 'classnames';
import { actionCreators as deviceSettingsActions } from '../ducks/modules/deviceSettings';
import '../styles/main.scss';
import { isElectron, isCordova, isWindows, isMacOS, isLinux, isPreview, getEnv } from '../utils/Environment';
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

    if (isCordova()) {
      // Enable viewport shrinking on iOS to mirror behaviour on android.
      window.Keyboard.shrinkView(true);
    }

    const env = getEnv();

    if (!env.REACT_APP_TEST) {
      // Spy on window fullscreen status
      if (isElectron() && !isPreview()) {
        const win = this.getElectronWindow();
        win.setFullScreen(!!this.props.startFullScreen);

        win.on('enter-full-screen', () => {
          this.props.setStartFullScreen(true);
        });

        win.on('leave-full-screen', () => {
          this.props.setStartFullScreen(false);
        });
      }
    }
  }

  componentDidUpdate() {
    this.setFontSize();
  }

  setFontSize = () => {
    const root = document.documentElement;
    const newFontSize = this.props.useDynamicScaling ?
      `${(1.65 * this.props.interfaceScale) / 100}vmin` :
      `${(16 * this.props.interfaceScale) / 100}px`;

    root.style.setProperty('--base-font-size', newFontSize);
  }

  getElectronWindow = () => {
    if (isElectron()) {
      const electron = window.require('electron');
      return electron.remote.getCurrentWindow();
    }
    return false;
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
        'app--preview': isPreview(),
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
  startFullScreen: PropTypes.bool.isRequired,
  setStartFullScreen: PropTypes.func.isRequired,
};

App.defaultProps = {
  children: null,
};

const mapDispatchToProps = dispatch => ({
  setStartFullScreen: value => dispatch(deviceSettingsActions.setSetting('startFullScreen', value)),
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
