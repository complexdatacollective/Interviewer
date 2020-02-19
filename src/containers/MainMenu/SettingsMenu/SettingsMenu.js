import React, { useState } from 'react';
import { Modal, Icon } from '@codaco/ui';
import { motion } from 'framer-motion';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { actionCreators as uiActions } from '../../../ducks/modules/ui';
import Scroller from '../../../components/Scroller';
import VisualPreferences from './VisualPreferences';
import DeviceSettings from './DeviceSettings';
import DeveloperTools from './DeveloperTools';

const SettingsMenu = (props) => {
  const {
    isOpen,
  } = props;

  const tabs = {
    'Visual Preferences': VisualPreferences,
    'Device Settings': DeviceSettings,
    'Developer Tools': DeveloperTools,
  };

  const [activeTab, setActiveTab] = useState('Visual Preferences');

  const TabComponent = tabs[activeTab];

  const navTabs = Object.keys(tabs).map(tabName => (
    <motion.li onClick={() => setActiveTab(tabName)}>{tabName}</motion.li>
  ));

  return (
    <Modal show>
      <div
        className="settings-menu"
      >
        <header className="settings-menu__header">
          <h1>Settings Menu</h1>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon name="close" />
          </motion.div>
        </header>
        <article className="settings-menu__wrapper">
          <nav>
            <ul>
              { navTabs }
            </ul>
          </nav>
          <section>
            <h1>{activeTab}</h1>
            <Scroller>
              <TabComponent />
            </Scroller>
          </section>
        </article>
      </div>
    </Modal>
  );
};


const mapDispatchToProps = dispatch => ({
  closeMenu: () => dispatch(uiActions.update({ isMenuOpen: false })),
});

export default compose(
  connect(null, mapDispatchToProps),
)(SettingsMenu);

