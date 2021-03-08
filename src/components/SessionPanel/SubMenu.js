import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@codaco/ui';
import { connect } from 'react-redux';
import { motion } from 'framer-motion';
import { compose } from 'recompose';
import { actionCreators as sessionActions } from '../../ducks/modules/session';
import { actionCreators as uiActions } from '../../ducks/modules/ui';

const SubMenu = (props) => {
  const {
    setShowSubMenu,
    setExpanded,
    openSettingsMenu,
    endSession,
  } = props;

  const variants = {
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.2 },
    },
    hide: {
      opacity: 0,
      transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
  };

  const itemVariants = {
    show: {
      y: 0,
      opacity: 1,
      transition: {
        y: { stiffness: 1000, velocity: -100 },
      },
    },
    hide: {
      y: '20%',
      opacity: 0,
      transition: {
        y: { stiffness: 1000 },
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      className="sub-menu"
      animate="show"
      initial="hide"
      layout
      key="sub-menu"
    >
      <motion.article layout className="sub-menu__wrapper">
        <h1>Menu</h1>
        <div className="sub-menu__items">
          <motion.div
            className="item"
            onClick={() => { openSettingsMenu(); setExpanded(false); }}
            variants={itemVariants}
          >
            <Icon name="settings" />
            Device Settings
          </motion.div>
          <motion.div
            className="item"
            onClick={() => setShowSubMenu(false)}
            variants={itemVariants}
          >
            <Icon name="menu-default-interface" />
            Interview Stages
          </motion.div>
        </div>
        <motion.div
          className="sub-menu__exit"
          variants={itemVariants}
        >
          <div className="item" onClick={endSession}>
            <Icon name="menu-quit" />
            Exit Interview
          </div>
        </motion.div>
      </motion.article>

    </motion.div>
  );
};

const mapDispatchToProps = (dispatch) => ({
  endSession: () => dispatch(sessionActions.endSession()),
  openSettingsMenu: () => dispatch(uiActions.update({ settingsMenuOpen: true })),
});

SubMenu.propTypes = {
  setShowSubMenu: PropTypes.func.isRequired,
  setExpanded: PropTypes.func.isRequired,
  openSettingsMenu: PropTypes.func.isRequired,
  endSession: PropTypes.func.isRequired,
};

export default compose(
  connect(null, mapDispatchToProps),
)(SubMenu);
