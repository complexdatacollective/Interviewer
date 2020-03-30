import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import Scroller from '../../components/Scroller';
import VisualPreferences from './Sections/VisualPreferences';
import DeviceSettings from './Sections/DeviceSettings';
import DeveloperTools from './Sections/DeveloperTools';
import CloseButton from '../../components/CloseButton';
import getVersion from '../../utils/getVersion';


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
    closeMenu,
    settingsMenuOpen,
  } = props;

  const tabs = {
    'General Settings': DeviceSettings,
    'Data Export Options': DeveloperTools,
    Pairing: DeveloperTools,
    'Visual Preferences': VisualPreferences,
    'Developer Options': DeveloperTools,
  };

  const [activeTab, setActiveTab] = useState('General Settings');
  const [appVersion, setAppVersion] = useState('0.0.0');

  getVersion().then(version => setAppVersion(version));

  const renderNavigation = Object.keys(tabs).map(tabName => (
    <motion.li
      key={tabName}
      onClick={() => setActiveTab(tabName)}
      className={activeTab === tabName ? 'active' : ''}
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
        transition={{ duration: 0.2 }}
      >
        <h1>{tabName}</h1>
        <Scroller>
          <TabComponent closeMenu={closeMenu} />
        </Scroller>
      </motion.div>
    );
  });

  return (
    <React.Fragment>
      { settingsMenuOpen && (
        <div
          className="main-menu settings-menu"
        >
          <article className="main-menu__wrapper settings-menu__wrapper">
            <nav>
              <ul>
                { renderNavigation }
              </ul>
              <div className="version-code">Network Canvas {appVersion}</div>
            </nav>
            <section>
              <CloseButton onClick={closeMenu} className="close-button-wrapper" />
              <AnimatePresence exitBeforeEnter>
                { renderTabs }
              </AnimatePresence>
            </section>
          </article>
        </div>
      )}
    </React.Fragment>

  );
};

const mapStateToProps = state => ({
  settingsMenuOpen: state.ui.settingsMenuOpen,
});

const mapDispatchToProps = dispatch => ({
  closeMenu: () => dispatch(uiActions.update({ settingsMenuOpen: false })),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(SettingsMenu);

