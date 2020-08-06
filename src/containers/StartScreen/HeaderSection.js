import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { connect } from 'react-redux';
import { Button } from '@codaco/ui';
import Switch from './Switch';
import NCLogo from '../../images/NC-Round.svg';

const HeaderSection = (props) => {
  // const {
  // } = props;

  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <React.Fragment>
      <motion.header className="start-screen-section start-screen-header">
        <div className="start-screen-header__wrapper">
          <div className="header-mark">
            <h1>Network Canvas</h1>
            <h4>Simplifying complex network data collection.</h4>
          </div>
          <div className="header-brand">
            <img src={NCLogo} className="header-logo" alt="Network Canvas" />
          </div>
        </div>
        <div className="version-string">5.2.0</div>
      </motion.header>
      <motion.section
        layout
        className="start-screen-section welcome-section"
      >
        <AnimatePresence>
          { showWelcome && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              layout
              transition={{
                duration: 0.15,
              }}
              className="welcome-section__content"
            >
              <main>
                <h2>Welcome to Network Canvas!</h2>
                <p className="lead">
                  Thank you for taking the time to explore our software. For feedback and
                  support, please visit <a href="https://networkcanvas.com">networkcanvas.com</a>.
                </p>
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
        <motion.footer layout>
          <Switch
            className="welcome-header__header-toggle"
            label="Show welcome message"
            on={showWelcome}
            onChange={() => setShowWelcome(!showWelcome)}
          />
        </motion.footer>
      </motion.section>
    </React.Fragment>
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
