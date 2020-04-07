import React from 'react';
import { Icon } from '@codaco/ui';
import { motion } from 'framer-motion';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { actionCreators as uiActions } from '../../ducks/modules/ui';


const SettingsMenuButton = props => (
  <motion.div
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    className="settings-menu-button"
    onClick={props.openSettingsMenu}
    {...props}
  >
    <Icon name="settings" />
  </motion.div>
);

const mapDispatchToProps = dispatch => ({
  openSettingsMenu: () => dispatch(uiActions.update({ settingsMenuOpen: true })),
});

export default compose(
  connect(null, mapDispatchToProps),
)(SettingsMenuButton);
