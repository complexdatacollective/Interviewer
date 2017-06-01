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
    // eslint-disable-next-line
    console.log('quit');
  }

  onReset = () => {
    // eslint-disable-next-line
    console.log('reset');
  }

  render() {
    const {
      isOpen, toggleMenu,
    } = this.props;

    const items = [
      { id: 'quit', title: 'Quit Network Canvas', interfaceType: 'quit', isActive: false, onClick: this.onQuit },
      { id: 'reset', title: 'Reset Session', interfaceType: 'reset', isActive: false, onClick: this.onReset },
    ];

    return (
      <Menu
        isOpen={isOpen}
        items={items}
        title="Session"
        toggleMenu={toggleMenu}
      />
    );
  }
}

SessionMenu.propTypes = {
  isOpen: PropTypes.bool,
  toggleMenu: PropTypes.func.isRequired,
};

SessionMenu.defaultProps = {
  isOpen: false,
};

function mapStateToProps(state) {
  return {
    isOpen: sessionMenuIsOpen(state),
  };
}

const mapDispatchToProps = dispatch => ({
  toggleMenu: bindActionCreators(menuActions.toggleSessionMenu, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(SessionMenu);
