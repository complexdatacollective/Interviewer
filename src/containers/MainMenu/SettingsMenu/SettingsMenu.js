import React, { useState } from 'react';
import { Modal, Icon } from '@codaco/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import { actionCreators as uiActions } from '../../../ducks/modules/ui';
import Scroller from '../../../components/Scroller';
import VisualPreferences from './VisualPreferences';
import DeviceSettings from './DeviceSettings';
import DeveloperTools from './DeveloperTools';

const tabVariants = {
  hidden: {
    opacity: 0,
    transition: {
      // when: 'afterChildren',
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
  visible: {
    opacity: 1,
    transition: {
      // when: 'beforeChildren',
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

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

  const renderNavigation = Object.keys(tabs).map(tabName => (
    <motion.li onClick={() => setActiveTab(tabName)}>{tabName}</motion.li>
  ));

  const renderTabs = Object.keys(tabs).map((tabName) => {
    const TabComponent = tabs[tabName];
    const isActive = activeTab === tabName;
    if (!isActive) { return ''; }
    return (
      <motion.div
        key={tabName}
        className="tab"
        variants={tabVariants}
        initial="hidden"
        exit="hidden"
        animate={isActive ? 'visible' : 'hidden'}
        transition={{ duration: getCSSVariableAsNumber('--animation-duration-fast-ms') / 1000 }}
      >
        <h1>{tabName}</h1>
        <Scroller>
          <TabComponent />
        </Scroller>
      </motion.div>
    );
  });

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
              { renderNavigation }
            </ul>
          </nav>
          <section>
            <AnimatePresence exitBeforeEnter>
              { renderTabs }
            </AnimatePresence>
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

