import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withHandlers, compose } from 'recompose';
import { actionCreators as mockActions } from '../ducks/modules/mock';
import { actionCreators as menuActions } from '../ducks/modules/menu';
import { actionCreators as modalActions } from '../ducks/modules/modals';
import { sessionMenuIsOpen } from '../selectors/session';
import { isCordova, isElectron } from '../utils/Environment';
import { Menu, Modal } from '../components';
import createGraphML from '../utils/ExportData';
import { Dialog } from '../containers/';
import Updater from '../utils/Updater';
import getVersion from '../utils/getVersion';
import ServerDiscoverer from '../utils/serverDiscoverer';

const updater = new Updater();
const serverDiscoverer = ServerDiscoverer();

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
  serverDiscoveryModal: {
    title: 'Server Discovery',
    type: 'info',
    additionalInformation: '',
    content: null,
    onConfirm: () => { },
    confirmLabel: 'Continue',
    hasCancelButton: true,
  },
};

/**
  * Renders a Menu using stages to construct items in the menu
  * @extends Component
  */
class SessionMenu extends Component {
  constructor() {
    super();

    this.state = initialState;
    updater.on('UPDATE_AVAILABLE', ({ version, releaseNotes }) => {
      this.setState({
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
    this.props.registerModal('SERVER_DISCOVERY');

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

  getServerDiscoveryInfo = () => {
    this.setState({
      serverDiscoveryModal: {
        ...this.state.serverDiscoveryModal,
        content: 'bloop',
      },
    }, () => {
      this.props.openModal('SERVER_DISCOVERY');
    });
  }

  stopServerDiscovererListen = () => {
    serverDiscoverer.stopListening();
  }

  confirmUpdateDownload = () => {
    // User clicked download Button
    // TODO: implement progress updates/loader
    // Trigger the download. Returns promise.
    updater.downloadUpdate();
  }

  render() {
    const {
      customItems, hideButton, isOpen, toggleMenu, addMockNodes,
    } = this.props;

    const { version } = this.state;

    const menuType = 'settings';

    const items = [
      { id: 'export', label: 'Download Data', icon: 'menu-download-data', onClick: this.onExport },
      { id: 'reset', label: 'Reset Session', icon: 'menu-purge-data', onClick: this.onReset },
      { id: 'mock-data', label: 'Add mock nodes', icon: 'menu-custom-interface', onClick: addMockNodes },
      ...customItems,
      { id: 'quit', label: 'Quit Network Canvas', icon: 'menu-quit', onClick: this.onQuit },
    ];

    if (isElectron()) {
      items.push({
        id: 'update-check',
        label: 'Check for Update',
        icon: 'menu-custom-interface',
        onClick: updater.checkForUpdate,
      });
    }

    if (isElectron() || isCordova()) {
      items.push({
        id: 'server-discovery',
        label: 'Pair with Server',
        icon: 'menu-custom-interface',
        onClick: this.getServerDiscoveryInfo,
      });
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
          confirmLabel={this.state.updateDialog.confirmLabel}
          hasCancelButton={this.state.updateDialog.hasCancelButton}
          additionalInformation={this.state.updateDialog.additionalInformation}
          onConfirm={this.state.updateDialog.onConfirm}
        >
          {this.state.updateDialog.content}
        </Dialog>
        <Modal
          name="SERVER_DISCOVERY"
          title={this.state.serverDiscoveryModal.title}
          onCloseModal={this.stopServerDiscovererListen}
        >
          {this.state.serverDiscoveryModal.content}
        </Modal>
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
  registerModal: PropTypes.func.isRequired,
  resetState: PropTypes.func.isRequired,
  toggleMenu: PropTypes.func.isRequired,
  addMockNodes: PropTypes.func.isRequired,
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
  registerModal: bindActionCreators(modalActions.registerModal, dispatch),
  resetState: bindActionCreators(menuActions.resetState, dispatch),
  toggleMenu: bindActionCreators(menuActions.toggleSessionMenu, dispatch),
  generateNodes: bindActionCreators(mockActions.generateNodes, dispatch),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withHandlers({
    addMockNodes: props => () => {
      props.generateNodes(20);
    },
  }),
)(SessionMenu);
