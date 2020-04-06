import React from 'react';
import { Icon } from '@codaco/ui';
import { connect } from 'react-redux';
import { motion, useInvertedScale } from 'framer-motion';
import { compose } from 'recompose';
import { baseAnimationDuration, baseAnimationEasing } from '../../components/Timeline/Timeline';
import { actionCreators as sessionActions } from '../../ducks/modules/session';
import { actionCreators as uiActions } from '../../ducks/modules/ui';

const SubMenu = (props) => {
  const {
    setShowSubMenu,
    openSettingsMenu,
    endSession,
  } = props;

  const { scaleX, scaleY } = useInvertedScale();

  const variants = {
    normal: {
      opacity: 0,
      transition: {
        duration: baseAnimationDuration,
        easing: baseAnimationEasing,
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
    expanded: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.075,
        // delayChildren: 0.2,
        // delay: 0.2,
        duration: baseAnimationDuration,
        easing: baseAnimationEasing,
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      className="sub-menu"
      exit="expanded"
      style={{ scaleX, scaleY }}
      key="sub-menu"
    >
      <article className="sub-menu__wrapper">
        <div className="sub-menu__items">
          <div className="item" onClick={() => { openSettingsMenu(); props.setExpanded(false); }}>
            <Icon name="settings" />
            Device Settings
          </div>
          <div className="item" onClick={() => setShowSubMenu(false)}>
            <Icon name="menu-default-interface" />
            Interview Stages
          </div>
        </div>
        <div className="sub-menu__exit">
          <div className="item" onClick={endSession}>
            <Icon name="menu-quit" />
            Exit Interview
          </div>
        </div>
      </article>

    </motion.div>
  );
};


const mapDispatchToProps = dispatch => ({
  endSession: () => dispatch(sessionActions.endSession()),
  openSettingsMenu: () => dispatch(uiActions.update({ settingsMenuOpen: true })),
});

export default compose(
  connect(null, mapDispatchToProps),
)(SubMenu);
