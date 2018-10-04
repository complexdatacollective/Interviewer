import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { bindActionCreators } from 'redux';
import { withHandlers, compose } from 'recompose';
import xss from 'xss';

import { actionCreators as mockActions } from '../ducks/modules/mock';
import { actionCreators as menuActions } from '../ducks/modules/menu';
import { actionCreators as modalActions } from '../ducks/modules/modals';
import { actionCreators as sessionActions } from '../ducks/modules/session';
import { anySessionIsActive, settingsMenuIsOpen } from '../selectors/session';
import { isCordova, isElectron } from '../utils/Environment';
import { Menu } from '../components';
import { Dialog } from '../containers/';
import Updater from '../utils/Updater';
import getVersion from '../utils/getVersion';

const updater = new Updater();

const initialState = {
  version: '0.0.0',
  updateDialog: {
    title: 'Update Dialog',
    type: 'info',
    additionalInformation: '',
    content: null,
    onConfirm: () => {},
    confirmLabel: 'Continue',
    hasCancelButton: false,
  },
};

const toggleFullscreen = () => {
  // Todo: use inEnvironment to provide a browser based verion of this.
  // Is there anything we can do for Chromebooks?

  const electron = window.require('electron');
  const electronWindow = electron.remote.getCurrentWindow();

  if (electronWindow.isFullScreen()) {
    electronWindow.setFullScreen(false);
  } else {
    electronWindow.setFullScreen(true);
  }
};

function createMarkup(htmlString) {
  const safeString = xss(htmlString, {
    whiteList: {
      h3: [],
      p: [],
      ul: [],
      li: [],
    },
    stripIgnoreTag: true,
  });

  // eslint-disable-next-line react/no-danger
  return <div dangerouslySetInnerHTML={{ __html: safeString }} />;
}

/**
  * Renders a Menu using stages to construct items in the menu
  * @extends Component
  */
class SettingsMenu extends Component {
  constructor() {
    super();

    this.state = initialState;
    updater.on('UPDATE_AVAILABLE', ({ version, releaseNotes }) => {
      this.setState({
        updateDialog: {
          title: `Version ${version} is Available`,
          type: 'info',
          content: `Version ${version} of Network Canvas is available to download. You are currently using ${this.state.version}. Would you like to download it now?`,
          additionalInformation: createMarkup(releaseNotes),
          onConfirm: () => { this.confirmUpdateDownload(); },
          confirmLabel: 'Download now',
          hasCancelButton: true,
        },
      }, () => {
        this.props.openModal('UPDATE_DIALOG');
      });
    });

    updater.on('UPDATE_NOT_AVAILABLE', () => {
      this.setState({
        updateDialog: {
          title: 'No Updates Available',
          type: 'info',
          content: 'You are using the latest available version of Network Canvas.',
          additionalInformation: '',
          onConfirm: () => {},
          confirmLabel: 'Okay',
          hasCancelButton: false,
        },
      }, () => {
        this.props.openModal('UPDATE_DIALOG');
      });
    });

    updater.on('UPDATE_DOWNLOADED', () => {
      this.setState({
        updateDialog: {
          title: 'Update Ready to Install',
          type: 'warning',
          additionalInformation: '',
          content: 'Your update is ready to install. Network Canvas will now close, and will reopen once the update is configured. Make sure you have saved any data within the app before continuing.',
          onConfirm: () => { updater.installUpdate(); },
          confirmLabel: 'Install and Restart',
          hasCancelButton: true,
        },
      }, () => {
        this.props.openModal('UPDATE_DIALOG');
      });
    });

    updater.on('ERROR', (error) => {
      this.setState({
        updateDialog: {
          title: 'An Error Occured',
          type: 'error',
          content: 'An error has occured while checking for an update. More information to help diagnose the issue can be found below.',
          additionalInformation: error,
          onConfirm: () => {},
          confirmLabel: 'Okay',
          hasCancelButton: false,
        },
      }, () => {
        this.props.openModal('UPDATE_DIALOG');
      });
    });
  }

  componentWillMount() {
    getVersion().then((version) => {
      this.setState(...this.state, {
        version,
      });
    });
  }

  onQuit = () => {
    if (isCordova()) {
      // Android supports exiting
      if (navigator.app && navigator.app.exitApp) {
        navigator.app.exitApp();
      }
    } else {
      // note: this will only close windows opened by the app, not a new tab the user opened
      window.close();
    }
  };

  onReset = () => {
    this.props.openModal('CONFIRM_DELETE_DATA');
  };

  confirmUpdateDownload = () => {
    // User clicked download Button
    // TODO: implement progress updates/loader
    // Trigger the download. Returns promise.
    updater.downloadUpdate();
  }

  toggleDevTools = () => {
    if (!isElectron()) return;
    const electron = window.require('electron');
    const electronWebContents = electron.remote.getCurrentWebContents();
    electronWebContents.toggleDevTools();
  };

  render() {
    const {
      sessionExists, customItems, isOpen, toggleMenu, addMockNodes,
    } = this.props;

    const { version } = this.state;

    const items = [
      { id: 'main-menu', label: 'Return to Start', icon: 'menu-quit', onClick: this.props.endSession },
      { id: 'reset', label: 'Reset All Data', icon: 'menu-purge-data', onClick: this.onReset },
      ...customItems,
    ];

    if (sessionExists) {
      items.push(
        { id: 'mock-data', label: 'Add mock nodes', icon: 'menu-custom-interface', onClick: addMockNodes },
      );
    }

    if (isElectron()) {
      items.push({
        id: 'update-check',
        label: 'Check for Update',
        icon: 'menu-custom-interface',
        onClick: updater.checkForUpdate,
      });
      items.push({ id: 'toggle-fullscreen', label: 'Toggle Fullscreen', icon: 'menu-custom-interface', onClick: toggleFullscreen });
      items.push({ id: 'toggle-dev-tools', label: 'Toggle DevTools', onClick: this.toggleDevTools });
    }

    if (!isCordova() || (navigator.app && navigator.app.exitApp)) {
      items.push({ id: 'quit', label: 'Quit Network Canvas', icon: 'menu-quit', onClick: this.onQuit });
    }

    items.map((item) => {
      const temp = item;
      if (!temp.menuType) {
        temp.menuType = 'settings';
      }
      if (!temp.icon) {
        temp.icon = 'menu-custom-interface';
      }
      return temp;
    });

    return (
      <Menu
        isOpen={isOpen}
        items={items}
        title="Settings"
        toggleMenu={toggleMenu}
      >
        <div style={{ position: 'fixed', top: 0, right: 0, display: 'inline', padding: '1rem', whiteSpace: 'nowrap', zIndex: 1000 }}>{ version }</div>
        <Dialog
          name="CONFIRM_DELETE_DATA"
          title="Delete ALL data?"
          type="warning"
          confirmLabel="Yes, delete data"
          onConfirm={this.props.resetState}
        >
          <p>
            This will remove <strong>all</strong> data from the app.
            Are you sure you want to continue?
          </p>
        </Dialog>
        <Dialog
          name="UPDATE_DIALOG"
          title={this.state.updateDialog.title}
          type={this.state.updateDialog.type}
          confirmLabel={this.state.updateDialog.confirmLabel}
          hasCancelButton={this.state.updateDialog.hasCancelButton}
          additionalInformation={this.state.updateDialog.additionalInformation}
          onConfirm={this.state.updateDialog.onConfirm}
        >
          {this.state.updateDialog.content}
        </Dialog>
      </Menu>
    );
  }
}

SettingsMenu.propTypes = {
  addMockNodes: PropTypes.func.isRequired,
  customItems: PropTypes.array.isRequired,
  endSession: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  openModal: PropTypes.func.isRequired,
  resetState: PropTypes.func.isRequired,
  sessionExists: PropTypes.bool,
  toggleMenu: PropTypes.func.isRequired,
};

SettingsMenu.defaultProps = {
  sessionExists: false,
  isOpen: false,
};

function mapStateToProps(state) {
  return {
    customItems: state.menu.customMenuItems,
    isOpen: settingsMenuIsOpen(state),
    sessionExists: anySessionIsActive(state),
  };
}

const mapDispatchToProps = dispatch => ({
  generateNodes: bindActionCreators(mockActions.generateNodes, dispatch),
  openModal: bindActionCreators(modalActions.openModal, dispatch),
  endSession: () => {
    dispatch(sessionActions.endSession());
    dispatch(push('/'));
  },
  resetState: () => dispatch(push('/reset')),
  toggleMenu: bindActionCreators(menuActions.toggleSettingsMenu, dispatch),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withHandlers({
    addMockNodes: props => () => {
      props.generateNodes(20);
    },
  }),
)(SettingsMenu);
