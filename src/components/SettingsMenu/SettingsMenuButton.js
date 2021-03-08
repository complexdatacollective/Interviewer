import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@codaco/ui';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { actionCreators as uiActions } from '../../ducks/modules/ui';

const SettingsMenuButton = (props) => (
  <motion.div
    className="settings-menu-button"
    onClick={props.openSettingsMenu}
  >
    <Icon name="settings" />
    <h4>Settings</h4>
  </motion.div>
);

const mapDispatchToProps = (dispatch) => ({
  openSettingsMenu: () => dispatch(uiActions.update({ settingsMenuOpen: true })),
});

export default compose(
  connect(null, mapDispatchToProps),
)(SettingsMenuButton);
