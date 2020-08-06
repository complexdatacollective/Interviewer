import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { connect } from 'react-redux';
import { Button } from '@codaco/ui';
import Switch from './Switch';
import NCLogo from '../../images/NC-Round.svg';
import { SettingsMenuButton } from '../../components/SettingsMenu';

const HeaderSection = (props) => {
  // const {
  // } = props;

  const springy = {
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        when: 'beforeChildren',
        delayChildren: 0.25,
      },
    },
    hidden: {
      opacity: 0,
      scale: 0.5,
      transition: {
        type: 'spring',
        when: 'afterChildren',
      },
    },
  };

  const start = {
    visible: {
      height: 'auto',
      opacity: 1,
      transition: {
        type: 'spring',
      },
    },
    hidden: {
      height: 0,
      opacity: 0,
    },
  };

  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <motion.div variants={springy} layout className="start-screen-section start-screen-header">
      <motion.div layout className="start-screen-header__wrapper">
        <div className="header-mark">
          <h1>Network Canvas</h1>
          <h4>Simplifying complex network data collection.</h4>
        </div>
        <div className="header-brand">
          <img src={NCLogo} className="header-logo" alt="Network Canvas" />
        </div>
        <div className="version-string">5.2.0</div>
      </motion.div>
      <motion.section
        layout
        initial="hidden"
        className="welcome-section"
      >
        <motion.footer layout>
          <Switch
            className="welcome-header__header-toggle"
            label="Show getting started"
            on={showWelcome}
            onChange={() => setShowWelcome(!showWelcome)}
          />
          <SettingsMenuButton />
        </motion.footer>
        <AnimatePresence initial={false}>
          { showWelcome && (
            <motion.div
              initial="hidden"
              exit="hidden"
              variants={start}
              layout
              className="welcome-section__content"
            >
              <main>
                <h2>Getting Started</h2>
                <div className="welcome-item">
                  <div className="welcome-item__action">
                    <Button color="primary">Watch overview video</Button>
                  </div>
                  <div className="welcome-item__description">
                    <p>
                      If this is your first time using Network Canvas, please consider taking
                      a moment to watch our overview video. It will introduce you to the key
                      concepts of the Network Canvas project.
                    </p>
                  </div>
                </div>
                <div className="welcome-item">
                  <div className="welcome-item__action">
                    <Button color="sea-serpent">Visit documentation website</Button>
                  </div>
                  <div className="welcome-item__description">
                    <p>
                      For further detailed information, tutorials, videos, and information about
                      collaboration, please visit our documentation website.
                    </p>
                  </div>
                </div>
                <div className="welcome-item">
                  <div className="welcome-item__action">
                    <Button color="mustard">Install sample protocol</Button>
                  </div>
                  <div className="welcome-item__description">
                    <p>
                  To get started right away, install one or more interview protocols
                  onto this device. For convenience, we have created a sample interview
                  protocol on the theme of &quot;public health&quot; research.
                    </p>
                  </div>
                </div>
              </main>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </motion.div>
  );
};

HeaderSection.propTypes = {
};

HeaderSection.defaultProps = {
};

function mapStateToProps(state) {
  return {
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HeaderSection);

export { HeaderSection as UnconnectedHeaderSection };
