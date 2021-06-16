import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Scroller } from '@codaco/ui';
import { getCSSVariableAsNumber, getCSSVariableAsString } from '@codaco/ui/lib/utils/CSSVariables';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { getActiveSession } from '../../selectors/session';
import VisualPreferences from './Sections/VisualPreferences';
import DeveloperTools from './Sections/DeveloperTools';
import Pairing from './Sections/Pairing';
import ExportOptions from './Sections/ExportOptions';
import CloseButton from '../CloseButton';

const SettingsMenu = (props) => {
  const {
    closeMenu,
    settingsMenuOpen,
  } = props;

  const getAnimationDuration = (variable) => getCSSVariableAsNumber(variable) / 1000;
  const baseAnimationEasing = getCSSVariableAsString('--animation-easing-json');

  const tabs = {
    'Visual Preferences': VisualPreferences,
    'Data Export Options': ExportOptions,
    Pairing,
    'Developer Options': DeveloperTools,
  };

  const baseVariants = {
    show: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
        duration: getAnimationDuration('--animation-duration-very-fast-ms'),
        easing: baseAnimationEasing,
      },
    },
    hide: {
      opacity: 0,
      transition: {
        when: 'afterChildren',
        duration: getAnimationDuration('--animation-duration-very-fast-ms'),
        easing: baseAnimationEasing,
      },
    },
  };

  const variants = {
    show: {
      x: '0%',
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
        duration: getAnimationDuration('--animation-duration-standard-ms'),
        easing: baseAnimationEasing,
      },
    },
    hide: {
      x: '-100%',
      transition: {
        when: 'afterChildren',
        staggerChildren: 0.05,
        staggerDirection: -1,
        duration: getAnimationDuration('--animation-duration-standard-ms'),
        easing: baseAnimationEasing,
      },
    },
  };

  const navVariants = {
    show: {
      y: '0%',
      opacity: 1,
      transition: {
        duration: getAnimationDuration('--animation-duration-very-fast-ms'),
        easing: baseAnimationEasing,
      },
    },
    hide: {
      y: '-10%',
      opacity: 0,
      transition: {
        duration: getAnimationDuration('--animation-duration-very-fast-ms'),
        easing: baseAnimationEasing,
      },
    },
  };

  const contentVariants = {
    show: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        duration: getAnimationDuration('--animation-duration-very-fast-ms'),
        delay: getAnimationDuration('--animation-duration-standard-ms'),
        easing: baseAnimationEasing,
      },
    },
    hide: {
      opacity: 0,
      transition: {
        when: 'afterChildren',
        duration: getAnimationDuration('--animation-duration-standard-ms'),
        easing: baseAnimationEasing,
      },
    },
  };

  const tabVariants = {
    hidden: {
      opacity: 0,
      transition: {
        staggerChildren: 0.1,
        staggerDirection: -1,
        duration: getAnimationDuration('--animation-duration-very-fast-ms'),
      },
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
        duration: getAnimationDuration('--animation-duration-very-fast-ms'),
      },
    },
  };

  const [activeTab, setActiveTab] = useState('Visual Preferences');

  const renderNavigation = Object.keys(tabs).map((tabName) => (
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
      { settingsMenuOpen && (
        <motion.div
          className="settings-menu"
          layout
          variants={baseVariants}
          animate="show"
          initial="hide"
          exit="hide"
        >
          <motion.article
            variants={baseVariants}
            layout
            className="settings-menu__wrapper"
          >
            <motion.nav
              variants={variants}
              layout
            >
              <h1>Settings</h1>
              <ul>
                { renderNavigation }
              </ul>
            </motion.nav>
            <motion.section layout variants={contentVariants}>
              <CloseButton onClick={closeMenu} className="close-button-wrapper" />
              {/* The presence animation is temporarily disabled because it breaks
              the tests (possible bug) */}
              {/* <AnimatePresence exitBeforeEnter initial={false}> */}
              { renderTabs }
              {/* </AnimatePresence> */}
            </motion.section>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>

  );
};

const mapStateToProps = (state) => ({
  isActiveSession: !!getActiveSession(state),
  settingsMenuOpen: state.ui.settingsMenuOpen,
});

const mapDispatchToProps = (dispatch) => ({
  closeMenu: () => dispatch(uiActions.update({ settingsMenuOpen: false })),
});

SettingsMenu.propTypes = {
  closeMenu: PropTypes.func.isRequired,
  settingsMenuOpen: PropTypes.bool.isRequired,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(SettingsMenu);
