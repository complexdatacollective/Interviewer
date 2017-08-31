import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { actionCreators as menuActions } from '../ducks/modules/menu';
import { actionCreators as modalActions } from '../ducks/modules/modals';
import { sessionMenuIsOpen } from '../selectors/session';
import { isCordova } from '../utils/Environment';
import { Menu } from '../components';
import createGraphML from '../utils/ExportData';
import { Dialog } from './Elements';
import { populateNodes } from '../utils/mockData';
import updater from '../utils/updater';
import getVersion from '../utils/getVersion';

function addMockNodes() {
  populateNodes(20);
}

/**
  * Renders a Menu using stages to construct items in the menu
  * @extends Component
  */
class SessionMenu extends Component {
  constructor() {
    super();

    this.state = {
      version: '0.0.0',
      updateDialog: {
        title: 'Update Dialog',
        type: 'info',
        additionalInformation: '',
        content: 'Yo yo yo yo yo.',
        onConfirm: () => {},
        confirmLabel: 'Continue',
        hasCancelButton: false,
      },
    };
  }

  componentWillMount() {
    getVersion().then((version) => {
      this.setState(...this.state, {
        version,
      });
    });
  }

  onExport = () => {
    createGraphML(this.props.currentNetwork, () => this.props.openModal('EXPORT_DATA'));
  };

  onQuit = () => {
    if (isCordova()) {
      // cordova
      navigator.app.exitApp();
    } else {
      // note: this will only close windows opened by the app, not a new tab the user opened
      window.close();
    }
  };

  onReset = () => {
    this.props.resetState();
  };

  checkForUpdates = () => {
    // Initialise the update checker. Returns a promise
    updater.checkForUpdate().then(
      (response) => {
        // Update available.
        const version = response.version.toString();
        const releaseNotes = response.releaseNotes.toString();
        this.setState(...this.state, {
          updateDialog: {
            title: `Version ${version} is Available`,
            type: 'info',
            content: `Version ${version} of Network Canvas is available to download. You are currently using ${this.state.version}. Would you like to download it now?`,
            additionalInformation: releaseNotes,
            onConfirm: () => { this.confirmUpdateDownload(); },
            confirmLabel: 'Download now',
            hasCancelButton: true,
          },
        }, () => {
          this.props.openModal('UPDATE_DIALOG');
        });
      },
      (failure) => {
        // No update available, or error.
        if (failure instanceof Error) {
          throw new Error(failure.message);
        }
        // No update available.
        this.setState(...this.state, {
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
      },
    ).catch(
      // Error while checking for updates
      (error) => {
        this.setState(...this.state, {
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
      },
    );
  }

  confirmUpdateDownload() {
    // User clicked download Button
    // TODO: implement progress updates/loader
    // Trigger the download. Returns promise.
    updater.downloadUpdate().then(
      // Update downloaded
      () => {
        this.setState(...this.state, {
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
      },
      // Update failed to download. Either cancelled or errored.
      (failure) => {
        // Test for error
        if (failure instanceof Error) {
          throw new Error(failure.message);
        }
        // Otherwise assumed cancelled.
        this.setState(...this.state, {
          updateDialog: {
            title: 'Error Encountered During Update',
            type: 'error',
            additionalInformation: '',
            content: 'An error has occured during the update process.',
            onConfirm: () => {},
            confirmLabel: 'Okay',
            hasCancelButton: false,
          },
        }, () => {
          this.props.openModal('UPDATE_DIALOG');
        });
      },
    ).catch(
      // Error while downloading update
      (error) => {
        this.setState(...this.state, {
          updateDialog: {
            title: 'An Error Occured',
            type: 'error',
            content: 'An error has occured during the update process. More information to help diagnose the issue can be found below.',
            additionalInformation: error,
            onConfirm: () => {},
            confirmLabel: 'Okay',
            hasCancelButton: false,
          },
        });
        // This shouldn't be here. But setState is async. How to handle better?
        setTimeout(() => {
          this.props.openModal('UPDATE_DIALOG');
        }, 1000);
      },
    );
  }

  render() {
    const {
      customItems, hideButton, isOpen, toggleMenu,
    } = this.props;

    const { version } = this.state;

    const menuType = 'settings';

    const items = [
      { id: 'export', title: 'Download Data', interfaceType: 'menu-download-data', onClick: this.onExport },
      { id: 'reset', title: 'Reset Session', interfaceType: 'menu-purge-data', onClick: this.onReset },
      { id: 'mock-data', title: 'Add mock nodes', interfaceType: 'menu-custom-interface', onClick: addMockNodes },
      { id: 'update-check', title: 'Check for Updates', interfaceType: 'menu-custom-interface', onClick: this.checkForUpdates },
      ...customItems,
      { id: 'quit', title: 'Quit Network Canvas', interfaceType: 'menu-quit', onClick: this.onQuit },
    ].map((item) => {
      const temp = item;
      if (!temp.menuType) {
        temp.menuType = 'settings';
      }
      if (!temp.interfaceType) {
        temp.interfaceType = 'menu-custom-interface';
      }
      return temp;
    });

    return (
      <Menu
        hideButton={hideButton}
        icon={menuType}
        isOpen={isOpen}
        items={items}
        title="Session"
        toggleMenu={toggleMenu}
      >
        <div style={{ position: 'absolute', top: 0, right: 0, display: 'inline', padding: '10px', zIndex: 1000 }}>{ version }</div>
        <Dialog
          name="EXPORT_DATA"
          title="Export Error"
          type="error"
          hasCancelButton={false}
          confirmLabel="Okay"
          onConfirm={() => {}}
        >
          <p>There was a problem exporting your data.</p>
        </Dialog>
        <Dialog
          name="UPDATE_DIALOG"
          title={this.state.updateDialog.title}
          type={this.state.updateDialog.type}
          show
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

SessionMenu.propTypes = {
  currentNetwork: PropTypes.object.isRequired,
  customItems: PropTypes.array.isRequired,
  hideButton: PropTypes.bool,
  isOpen: PropTypes.bool,
  openModal: PropTypes.func.isRequired,
  resetState: PropTypes.func.isRequired,
  toggleMenu: PropTypes.func.isRequired,
};

SessionMenu.defaultProps = {
  hideButton: false,
  isOpen: false,
};

function mapStateToProps(state) {
  return {
    customItems: state.menu.customMenuItems,
    isOpen: sessionMenuIsOpen(state),
    currentNetwork: state.network,
  };
}

const mapDispatchToProps = dispatch => ({
  openModal: bindActionCreators(modalActions.openModal, dispatch),
  resetState: bindActionCreators(menuActions.resetState, dispatch),
  toggleMenu: bindActionCreators(menuActions.toggleSessionMenu, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(SessionMenu);
