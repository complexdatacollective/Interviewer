import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { actionCreators as menuActions } from '../ducks/modules/menu';
import { sessionMenuIsOpen } from '../selectors/session';
import { Menu } from '../components';

/**
  * Renders a Menu using stages to construct items in the menu
  * @extends Component
  */
class SessionMenu extends Component {
  onQuit = () => {
    if (navigator.app) {
      // cordova
      navigator.app.exitApp();
    } else if (navigator.device) {
      navigator.device.exitApp();
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
      hideButton, isOpen, toggleMenu,
    } = this.props;

    const items = [
      { id: 'reset', title: 'Reset Session', interfaceType: 'menu-purge-data', isActive: false, onClick: this.onReset },
      { id: 'quit', title: 'Quit Network Canvas', interfaceType: 'menu-quit', isActive: false, onClick: this.onQuit },
    ];

    return (
      <Menu
        hideButton={hideButton}
        icon="settings"
        isOpen={isOpen}
        items={items}
        title="Session"
        toggleMenu={toggleMenu}
      />
    );
  }
}

SessionMenu.propTypes = {
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
    isOpen: sessionMenuIsOpen(state),
  };
}

const mapDispatchToProps = dispatch => ({
  resetState: bindActionCreators(menuActions.resetState, dispatch),
  toggleMenu: bindActionCreators(menuActions.toggleSessionMenu, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(SessionMenu);
