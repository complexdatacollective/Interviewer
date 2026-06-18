import { motion } from 'framer-motion';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import { Icon } from '@codaco/ui';

import { actionCreators as uiActions } from '../../ducks/modules/ui';

const SettingsMenuButton = ({ openSettingsMenu }) => (
  <motion.div className="settings-menu-button" onClick={openSettingsMenu}>
    <Icon name="settings" />
    <h4>Settings</h4>
  </motion.div>
);

const mapDispatchToProps = (dispatch) => ({
  openSettingsMenu: () =>
    dispatch(uiActions.update({ settingsMenuOpen: true })),
});

export default compose(connect(null, mapDispatchToProps))(SettingsMenuButton);
