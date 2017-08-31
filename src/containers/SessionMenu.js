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

function addMockNodes() {
  populateNodes(20);
}

/**
  * Renders a Menu using stages to construct items in the menu
  * @extends Component
  */
class SessionMenu extends Component {
  componentWillMount() {
    this.props.registerModal('EXPORT_DATA');
  }

  componentWillUnmount() {
    this.props.unregisterModal('EXPORT_DATA');
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

  render() {
    const {
      customItems, hideButton, isOpen, toggleMenu,
    } = this.props;

    const menuType = 'settings';

    const items = [
      { id: 'export', title: 'Download Data', interfaceType: 'menu-download-data', onClick: this.onExport },
      { id: 'reset', title: 'Reset Session', interfaceType: 'menu-purge-data', onClick: this.onReset },
      { id: 'mock-data', title: 'Add mock nodes', interfaceType: 'menu-custom-interface', onClick: addMockNodes },
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
        <Dialog
          name="EXPORT_DATA"
          title="Export Error"
          type="error"
          hasCancelButton={false}
          confirmLabel="Uh-oh"
          onConfirm={() => {}}
        >
          <p>There was a problem exporting your data.</p>
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
  registerModal: PropTypes.func.isRequired,
  resetState: PropTypes.func.isRequired,
  toggleMenu: PropTypes.func.isRequired,
  unregisterModal: PropTypes.func.isRequired,
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
  unregisterModal: bindActionCreators(modalActions.unregisterModal, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(SessionMenu);
