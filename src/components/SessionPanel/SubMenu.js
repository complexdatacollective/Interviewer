import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@codaco/ui';
import { connect } from 'react-redux';
import { motion, useInvertedScale } from 'framer-motion';
import { compose } from 'recompose';
import { getCSSVariableAsNumber, getCSSVariableAsString } from '@codaco/ui/lib/utils/CSSVariables';
import { actionCreators as sessionActions } from '../../ducks/modules/session';
import { actionCreators as uiActions } from '../../ducks/modules/ui';

const SubMenu = (props) => {
  const {
    setShowSubMenu,
    setExpanded,
    openSettingsMenu,
    endSession,
  } = props;

  const { scaleX, scaleY } = useInvertedScale();

  const baseAnimationDuration = getCSSVariableAsNumber('--animation-duration-standard-ms') / 1000;
  const baseAnimationEasing = getCSSVariableAsString('--animation-easing-json');

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
          <div className="item" onClick={() => { openSettingsMenu(); setExpanded(false); }}>
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

SubMenu.propTypes = {
  setShowSubMenu: PropTypes.func.isRequired,
  setExpanded: PropTypes.func.isRequired,
  openSettingsMenu: PropTypes.func.isRequired,
  endSession: PropTypes.func.isRequired,
};

export default compose(
  connect(null, mapDispatchToProps),
)(SubMenu);
