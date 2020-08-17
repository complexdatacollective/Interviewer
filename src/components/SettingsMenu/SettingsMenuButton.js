import React from 'react';
import { Button } from '@codaco/ui';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { actionCreators as uiActions } from '../../ducks/modules/ui';

const SettingsMenuButton = props => (
  <div className="settings-menu-button">
    <Button
      color="slate-blue"
      size="small"
      icon="settings"
      onClick={props.openSettingsMenu}
    >Settings</Button>
  </div>
);

const mapDispatchToProps = dispatch => ({
  openSettingsMenu: () => dispatch(uiActions.update({ settingsMenuOpen: true })),
});

export default compose(
  connect(null, mapDispatchToProps),
)(SettingsMenuButton);
