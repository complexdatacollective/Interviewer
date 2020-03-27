import React from 'react';
import { Icon, Button } from '@codaco/ui';
import { connect } from 'react-redux';
import { motion, useInvertedScale } from 'framer-motion';
import { compose } from 'recompose';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import { actionCreators as sessionActions } from '../../ducks/modules/session';

const SubMenu = (props) => {
  const {
    setShowSubMenu,
    setSettingsMenuOpen,
  } = props;

  const transitionDuration = getCSSVariableAsNumber('--animation-duration-fast-ms') / 1000;

  const { scaleX, scaleY } = useInvertedScale();

  const variants = {
    normal: {
      opacity: 0,
      transition: {
        duration: transitionDuration,
      },
    },
    expanded: {
      opacity: 1,
      transition: {
        duration: transitionDuration,
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
        <header className="sub-menu__header">
          <h1>Menu</h1>
        </header>
        <div className="sub-menu__items">
          <Button onClick={() => setShowSubMenu(false)} icon={<Icon name="menu-default-interface" />} color="cyber-grape">
            Show Interview Stages
          </Button>
          <Button onClick={() => setSettingsMenuOpen()} icon={<Icon name="settings" />} color="cyber-grape">
            Open Settings Menu
          </Button>
        </div>
        <div className="sub-menu__exit">
          <Button onClick={props.endSession} icon={<Icon name="menu-quit" />} color="cyber-grape">
            Exit Interview
          </Button>
        </div>
      </article>

    </motion.div>
  );
};


const mapDispatchToProps = {
  endSession: sessionActions.endSession,
};

export default compose(
  connect(null, mapDispatchToProps),
)(SubMenu);
