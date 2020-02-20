import React, { useState } from 'react';
import { Modal } from '@codaco/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import { actionCreators as uiActions } from '../../../ducks/modules/ui';
import Scroller from '../../../components/Scroller';
import VisualPreferences from './VisualPreferences';
import DeviceSettings from './DeviceSettings';
import DeveloperTools from './DeveloperTools';
import CloseButton from '../CloseButton';
import SettingsMenuButton from './SettingsMenuButton';
import getVersion from '../../../utils/getVersion';

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

const SettingsMenu = () => {
  const [open, toggleMenu] = useState(false);

  const tabs = {
    'Visual Preferences': VisualPreferences,
    'Device Settings': DeviceSettings,
    'Developer Tools': DeveloperTools,
  };

  const [activeTab, setActiveTab] = useState('Visual Preferences');
  const [appVersion, setAppVersion] = useState('0.0.0');

  getVersion().then(version => setAppVersion(version));

  const renderNavigation = Object.keys(tabs).map(tabName => (
    <motion.li
      key={tabName}
      onClick={() => setActiveTab(tabName)}
      className={activeTab === tabName ? 'active' : ''}
      // whileHover={{ scale: 1.1 }}
      // whileTap={{ scale: 0.95 }}
    >
      {tabName}
    </motion.li>
  ));

  const renderTabs = Object.keys(tabs).map((tabName) => {
    const TabComponent = tabs[tabName];
    const isActive = activeTab === tabName;
    if (!isActive) { return ''; }
    return (
      <motion.div
        key={tabName}
        className="tab-content"
        variants={tabVariants}
        initial="hidden"
        exit="hidden"
        animate={isActive ? 'visible' : 'hidden'}
        transition={{ duration: getCSSVariableAsNumber('--animation-duration-standard-ms') / 1000 }}
      >
        <h1>{tabName}</h1>
        <Scroller>
          <TabComponent />
        </Scroller>
      </motion.div>
    );
  });

  return (
    <React.Fragment>
      <div>
        <SettingsMenuButton onClick={() => { toggleMenu(true); }} />
      </div>
      <Modal show={open}>
        <div
          className="settings-menu"
        >
          <header className="settings-menu__header">
            <h1>Settings Menu</h1>
            <CloseButton onClick={() => toggleMenu(false)} />
          </header>
          <article className="settings-menu__wrapper">
            <nav>
              <ul>
                { renderNavigation }
              </ul>
              <div className="version-code">Version {appVersion}</div>
            </nav>
            <section>
              <AnimatePresence exitBeforeEnter>
                { renderTabs }
              </AnimatePresence>
            </section>
          </article>
        </div>
      </Modal>
    </React.Fragment>
  );
};

const mapDispatchToProps = dispatch => ({
  closeMenu: () => dispatch(uiActions.update({ isMenuOpen: false })),
});

export default compose(
  connect(null, mapDispatchToProps),
)(SettingsMenu);

