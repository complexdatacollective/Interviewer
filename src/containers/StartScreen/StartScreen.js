import React from 'react';
import { motion, AnimateSharedLayout } from 'framer-motion';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, GraphicButton } from '@codaco/ui';
import NCLogo from '../../images/NC-Round.svg';
import { ProtocolCard, Scroller } from '../../components';
import Switch from './Switch';


const ActionButton = props => {
  return (
    <div className="action-button">
      { props.children }
    </div>
  );
};

const StartScreen = (props) => {

  const springy = {
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
      },
    },
    hidden: {
      opacity: 0,
      scale: 0.5,
      transition: {
        type: 'spring',
      },
    },
  };

  const opacity = {
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.15,
      },
    },
    hidden: {
      opacity: 0,
    },
  };

  return (
    <div className="start-screen">
      <AnimateSharedLayout>
        <motion.div
          className="start-screen__container"
          initial="hidden"
          animate="visible"
          variants={opacity}
        >
          <motion.header variants={springy} className="start-screen-section start-screen-header">
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
          <motion.section variants={springy} className="start-screen-section welcome-section">
            <div className="welcome-section__content">
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
                  If this is your first
                  time using Network Canvas, please consider taking a moment to watch
                  the overview video below. It will introduce you to the key concepts
                  of the Network Canvas project.
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
            </div>
            <footer>
              <Switch
                className="welcome-header__header-toggle"
                label="Show welcome message"
                on
                onChange={() => console.log('clicked')}
              />
            </footer>
          </motion.section>
          <motion.section variants={springy} className="start-screen-section interview-section">
            <main className="interview-section__start-new">
              <div className="content-area">
                <div className="content-area__last-used">
                  <header>
                    <h2>Start an Interview</h2>
                  </header>
                  <ProtocolCard
                    attributes={{
                      schemaVersion: 5,
                      lastModified: new Date(),
                      installationDate: new Date(),
                      name: 'Development Protocol',
                      description: 'This is the development protocol',
                    }}
                  />
                </div>
                <div className="content-area__other">
                  <h4>Other protocols...</h4>
                  <Scroller>
                    <ProtocolCard
                      condensed
                      attributes={{
                        schemaVersion: 5,
                        lastModified: new Date(),
                        installationDate: new Date(),
                        name: 'Development Protocol',
                        description: 'This is the development protocol',
                      }}
                    />
                    <ProtocolCard
                      condensed
                      attributes={{
                        schemaVersion: 5,
                        lastModified: new Date(),
                        installationDate: new Date(),
                        name: 'Development Protocol',
                        description: 'This is the development protocol',
                      }}
                    />
                    <ProtocolCard
                      condensed
                      attributes={{
                        schemaVersion: 5,
                        lastModified: new Date(),
                        installationDate: new Date(),
                        name: 'Development Protocol',
                        description: 'This is the development protocol',
                      }}
                    />
                    <ProtocolCard
                      condensed
                      attributes={{
                        schemaVersion: 5,
                        lastModified: new Date(),
                        installationDate: new Date(),
                        name: 'Development Protocol',
                        description: 'This is the development protocol',
                      }}
                    />
                    <ProtocolCard
                      condensed
                      attributes={{
                        schemaVersion: 5,
                        lastModified: new Date(),
                        installationDate: new Date(),
                        name: 'Development Protocol',
                        description: 'This is the development protocol',
                      }}
                    />
                  </Scroller>
                </div>
              </div>
            </main>
            <main className="interview-section__install-section">
              <header>
                <h2>Install New Protocol</h2>
              </header>
              <div className="content-buttons">
                <GraphicButton
                  color="sea-green"
                >
                  <h3>Import</h3>
                  <h2>From URL</h2>
                </GraphicButton>
                <GraphicButton
                  color="slate-blue--dark"
                >
                  <h3>Import</h3>
                  <h2>From File</h2>
                </GraphicButton>
                <GraphicButton
                  color="mustard"
                >
                  <h3>Import</h3>
                  <h2>From Server</h2>
                </GraphicButton>
              </div>
            </main>
          </motion.section>
          <motion.section className="start-screen-section sessions-section">
            <main>
              <header>
                <h2>Interview Sessions</h2>
              </header>
            </main>
          </motion.section>
          <motion.section className="start-screen-section server-section">
            <main>
              <header>
                <h2>Server</h2>
              </header>
            </main>
          </motion.section>
        </motion.div>
      </AnimateSharedLayout>
    </div>
  );
};

StartScreen.defaultProps = {
};

StartScreen.propTypes = {

};

const mapDispatchToProps = {

};

const mapStateToProps = (state, ownProps) => {
  return {
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StartScreen);
