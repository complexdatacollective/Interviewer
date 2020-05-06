import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import cx from 'classnames';
import 'swiper/css/swiper.css';
import { actionCreators as deviceSettingsActions } from '../ducks/modules/deviceSettings';
import { actionCreators as pairingStatusActions } from '../ducks/modules/pairingStatus';
import '../styles/main.scss';
import { isElectron, isCordova, isWindows, isMacOS, isLinux, isPreview, getEnv, isIOS, isAndroid } from '../utils/Environment';
import DialogManager from '../components/DialogManager';
import { SettingsMenu } from '../components/SettingsMenu';
import ImportProgressOverlay from './ImportProtocol/ImportProgressOverlay';

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

    if (!env.REACT_APP_NO_FULLSCREEN) {
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

    // Check if existing pairedServer is reachable
    this.props.updatePairingStatus();

    // Check again if network changes
    window.addEventListener('online', this.props.updatePairingStatus);
    window.addEventListener('offline', this.props.updatePairingStatus);


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
      const electron = window.require('electron'); // eslint-disable-line global-require
      return electron.remote.getCurrentWindow();
    }
    return false;
  }

  render() {
    const { children } = this.props;

    setInterval(() => {

    }, 3000);

    return (
      <div className={cx({
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
          <ImportProgressOverlay
            show={this.props.importProtocolProgress && this.props.importProtocolProgress.step > 0}
            progress={this.props.importProtocolProgress}
          />
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
  updatePairingStatus: () => dispatch(pairingStatusActions.updatePairingStatus()),
});

function mapStateToProps(state) {
  return {
    interfaceScale: state.deviceSettings.interfaceScale,
    useDynamicScaling: state.deviceSettings.useDynamicScaling,
    startFullScreen: state.deviceSettings.startFullScreen,
    importProtocolProgress: state.importProtocol,
  };
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(App);
