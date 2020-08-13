import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import cx from 'classnames';
import { Button } from '@codaco/ui';
import 'swiper/css/swiper.css';
import { actionCreators as deviceSettingsActions } from '../ducks/modules/deviceSettings';
import { actionCreators as uiActions } from '../ducks/modules/ui';
import { actionCreators as dialogActions } from '../ducks/modules/dialogs';
import '../styles/main.scss';
import { isElectron, isCordova, isWindows, isMacOS, isLinux, isPreview, getEnv } from '../utils/Environment';
import DialogManager from '../components/DialogManager';
import MainMenu from '../containers/MainMenu';
import SettingsMenuButton from '../components/MainMenu/SettingsMenuButton';
import { openExternalLink } from '../components/ExternalLink';

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
    const { children, updateInfoShown, setUpdateInfoShown } = this.props;

    if (!updateInfoShown) {
      setUpdateInfoShown(true);

      this.props.openDialog({
        type: 'Notice',
        title: 'Please upgrade to continue receiving support',
        canCancel: false,
        message: (
          <React.Fragment>
            <p>
              Our initial development period has come to an end, and we are pleased to announce
              the release of the first stable versions of Network Canvas, Architect,
              and Server. Since stable versions are now available, the version of the software
              that you are currently using is no longer supported. Please visit our
              documentation website for information about how to update to the new versions.
            </p>
            <p>
              <Button
                color="sea-serpent"
                onClick={() => openExternalLink('https://documentation.networkcanvas.com/docs/technical-documentation/updating-from-beta/')}
              >
                Visit documentation website
              </Button>
            </p>
            <p>
              In the meantime, you can continue to use this version of the software
              in order to export data, or conclude any in-progress work. The stable releases include
              many new fixes and features collected from feedback you have provided, and we strongly
              encourage you to update to them as soon as possible.
            </p>
          </React.Fragment>
        ),
      });
    }

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
  openDialog: PropTypes.func.isRequired,
  updateInfoShown: PropTypes.bool,
  setUpdateInfoShown: PropTypes.func.isRequired,
};

App.defaultProps = {
  children: null,
  updateInfoShown: false,
};

const mapDispatchToProps = dispatch => ({
  setStartFullScreen: value => dispatch(deviceSettingsActions.setSetting('startFullScreen', value)),
  openDialog: config => dispatch(dialogActions.openDialog(config)),
  setUpdateInfoShown: shown => dispatch(uiActions.update({ updateInfoShown: shown })),
});

function mapStateToProps(state) {
  return {
    interfaceScale: state.deviceSettings.interfaceScale,
    useDynamicScaling: state.deviceSettings.useDynamicScaling,
    startFullScreen: state.deviceSettings.startFullScreen,
    updateInfoShown: state.ui.updateInfoShown,
  };
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(App);
