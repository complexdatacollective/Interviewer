import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';

import { Icon } from '../../ui/components';

import { DropObstacle } from '../../behaviours/DragAndDrop';
import { actionCreators as uiActions } from '../../ducks/modules/ui';

class SettingsMenuButton extends PureComponent {
  render() {
    return (
      <Icon name="settings" onClick={this.props.toggleMenu} className="app-settings" />
    );
  }
}

SettingsMenuButton.propTypes = {
  toggleMenu: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    toggleMenu: () => dispatch(uiActions.toggle('isMenuOpen')),
  };
}

export default compose(
  DropObstacle,
  connect(null, mapDispatchToProps),
)(SettingsMenuButton);
