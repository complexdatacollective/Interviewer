import React from 'react';
import { Icon } from '@codaco/ui';
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

  const slowDuration = getCSSVariableAsNumber('--animation-duration-slow-ms') / 1000;

  const { scaleX, scaleY } = useInvertedScale();

  const variants = {
    normal: {
      opacity: 0,
      transition: {
        duration: slowDuration,
      },
    },
    expanded: {
      opacity: 1,
      transition: {
        duration: slowDuration,
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
          <div className="sub-menu-item sub-menu-item--stages" onClick={() => setShowSubMenu(false)}>
            <Icon name="menu-default-interface" />
            <div>
              <h4>Show Interview Stages</h4>
              {/* <p>
                Show the stages of this interview.
              </p> */}
            </div>
          </div>
          <div className="sub-menu-item sub-menu-item--settings" onClick={() => setSettingsMenuOpen()}>
            <Icon name="settings" />
            <div>
              <h4>Open Settings Menu</h4>
              {/* <p>
                Change device settings, such as <strong>text size</strong> and <strong>export
                options</strong>.
              </p> */}
            </div>
          </div>
          <div className="sub-menu-item sub-menu-item--exit" onClick={props.endSession}>
            <Icon name="menu-quit" />
            <div>
              <h4>Exit Interview</h4>
              {/* <p>
                Leave this interview now, and return to the start screen. Your current
                interview will be saved, and you can resume it later.
              </p> */}
            </div>
          </div>
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
