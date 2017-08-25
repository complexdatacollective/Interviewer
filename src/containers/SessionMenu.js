import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { actionCreators as menuActions } from '../ducks/modules/menu';
import { sessionMenuIsOpen } from '../selectors/session';
import { isCordova, isElectron } from '../utils/Environment';
import { Menu } from '../components';

/**
  * Renders a Menu using stages to construct items in the menu
  * @extends Component
  */
class SessionMenu extends Component {
  onQuit = () => {
    if (isCordova()) {
      // cordova
      navigator.app.exitApp();
    } else {
      // note: this will only close windows opened by the app, not a new tab the user opened
      window.close();
    }
  }

  onReset = () => {
    this.props.resetState();
  }

  render() {
    const {
      customItems, hideButton, isOpen, toggleMenu,
    } = this.props;

    const menuType = 'settings';

    const items = [
      { id: 'reset', title: 'Reset Session', interfaceType: 'menu-purge-data', onClick: this.onReset },
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
      />
    );
  }
}

SessionMenu.propTypes = {
  customItems: PropTypes.array.isRequired,
  hideButton: PropTypes.bool,
  isOpen: PropTypes.bool,
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
  };
}

const mapDispatchToProps = dispatch => ({
  resetState: bindActionCreators(menuActions.resetState, dispatch),
  toggleMenu: bindActionCreators(menuActions.toggleSessionMenu, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(SessionMenu);
