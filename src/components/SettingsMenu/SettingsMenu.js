import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { getCSSVariableAsNumber, getCSSVariableAsString } from '@codaco/ui/lib/utils/CSSVariables';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import Scroller from '../Scroller';
import BackgroundDimmer from '../BackgroundDimmer';
import VisualPreferences from './Sections/VisualPreferences';
import DeveloperTools from './Sections/DeveloperTools';
import About from './Sections/About';
import Pairing from './Sections/Pairing';
import ExportOptions from './Sections/ExportOptions';
import CloseButton from '../CloseButton';

const SettingsMenu = (props) => {
  const {
    closeMenu,
    settingsMenuOpen,
  } = props;

  const baseAnimationDuration = getCSSVariableAsNumber('--animation-duration-standard-ms') / 1000;
  const baseAnimationEasing = getCSSVariableAsString('--animation-easing-json');

  const tabs = {
    'Visual Preferences': VisualPreferences,
    'Data Export Options': ExportOptions,
    Pairing,
    'Developer Options': DeveloperTools,
    About,
  };

  const variants = {
    show: {
      x: '0%',
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.07,
        duration: baseAnimationDuration,
        easing: baseAnimationEasing,
      },
    },
    hide: {
      x: '-100%',
      transition: {
        when: 'afterChildren',
        staggerChildren: 0.05,
        staggerDirection: -1,
        duration: baseAnimationDuration,
        easing: baseAnimationEasing,
      },
    },
  };

  const navVariants = {
    show: {
      y: '0%',
      opacity: 1,
      transition: {
        duration: baseAnimationDuration,
        easing: baseAnimationEasing,
      },
    },
    hide: {
      y: '20%',
      opacity: 0,
      transition: {
        duration: baseAnimationDuration,
        easing: baseAnimationEasing,
      },
    },
  };

  const contentVariants = {
    show: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        duration: baseAnimationDuration,
        delay: baseAnimationDuration,
        easing: baseAnimationEasing,
      },
    },
    hide: {
      opacity: 0,
      transition: {
        when: 'afterChildren',
        duration: baseAnimationDuration,
        easing: baseAnimationEasing,
      },
    },
  };

  const tabVariants = {
    hidden: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
        duration: baseAnimationDuration,
      },
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
        duration: baseAnimationDuration,
      },
    },
  };

  const [activeTab, setActiveTab] = useState('Visual Preferences');

  const renderNavigation = Object.keys(tabs).map(tabName => (
    <motion.li
      key={tabName}
      data-name={tabName}
      onClick={() => setActiveTab(tabName)}
      className={activeTab === tabName ? 'active' : ''}
      variants={navVariants}
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
      >
        <Scroller>
          <TabComponent closeMenu={closeMenu} />
        </Scroller>
      </motion.div>
    );
  });

  return (
    <AnimatePresence>
      <AnimatePresence>
        { settingsMenuOpen && (<BackgroundDimmer clickHandler={closeMenu} ><CloseButton onClick={closeMenu} className="close-button-wrapper" /></BackgroundDimmer>)}
      </AnimatePresence>
      { settingsMenuOpen && (
        <motion.div
          className="settings-menu"
          animate="show"
          exit="hide"
          initial="hide"
        >
          <article className="settings-menu__wrapper">
            <motion.nav
              variants={variants}
            >
              <h1>Settings</h1>
              <ul>
                { renderNavigation }
              </ul>
            </motion.nav>
            <motion.section variants={contentVariants}>
              <CloseButton onClick={closeMenu} className="close-button-wrapper" />
              { renderTabs }
            </motion.section>
          </article>
        </motion.div>
      )}
    </AnimatePresence>

  );
};

const mapStateToProps = state => ({
  settingsMenuOpen: state.ui.settingsMenuOpen,
});

const mapDispatchToProps = dispatch => ({
  closeMenu: () => dispatch(uiActions.update({ settingsMenuOpen: false })),
});

SettingsMenu.propTypes = {
  closeMenu: PropTypes.func.isRequired,
  settingsMenuOpen: PropTypes.bool.isRequired,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(SettingsMenu);

