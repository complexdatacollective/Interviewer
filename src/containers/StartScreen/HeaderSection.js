import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { connect } from 'react-redux';
import { Button } from '@codaco/ui';
import { Checkbox } from '@codaco/ui/lib/components/Fields';
import { Section } from '.';
import NCLogo from '../../images/NC-Round.svg';
import { actionCreators as deviceSettingsActions } from '../../ducks/modules/deviceSettings';
import { actionCreators as protocolActions } from '../../ducks/modules/importProtocol';
import { SettingsMenuButton } from '../../components/SettingsMenu';
import { openExternalLink } from '../../components/ExternalLink';

const HeaderSection = (props) => {
  const {
    showGettingStarted,
    toggleShowGettingStarted,
    importProtocolFromURI,
  } = props;

  const start = {
    visible: {
      height: '100%',
      opacity: 1,
      transition: {
        delay: 1,
        type: 'spring',
      },
    },
    hidden: {
      height: 0,
      opacity: 0,
    },
  };

  return (
    <React.Fragment>
      <Section className="start-screen-section start-screen-header">
        <motion.div layout className="start-screen-header__wrapper">
          <div className="header-mark">
            <h1>Network Canvas</h1>
            <h4>Simplifying complex network data collection.</h4>
          </div>
          <div className="header-brand">
            <img src={NCLogo} className="header-logo" alt="Network Canvas" />
          </div>
          <div className="version-string">5.2.0</div>
          <motion.footer layout>
            <SettingsMenuButton />
          </motion.footer>
        </motion.div>
      </Section>
      <AnimatePresence>
        { showGettingStarted && (
          <motion.div
            exit="hidden"
            variants={start}
            layout
          >
            <motion.section className="start-screen-section welcome-section">
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
                    <Button
                      color="sea-serpent"
                      onClick={() => openExternalLink('https://documentation.networkcanvas.com')}
                    >
                      Visit documentation website
                    </Button>
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
                    <Button
                      color="mustard"
                      onClick={() => importProtocolFromURI('https://documentation.networkcanvas.com/protocols/Public%20Health%20Demo%20Protocol.netcanvas')}
                    >
                      Install sample protocol
                    </Button>
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
              <motion.footer layout>
                <Checkbox
                  className="welcome-header__header-toggle"
                  label="Show 'getting started' card"
                  input={{
                    checked: showGettingStarted,
                  }}
                  onChange={toggleShowGettingStarted}
                />
              </motion.footer>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </React.Fragment>
  );
};

HeaderSection.propTypes = {
};

HeaderSection.defaultProps = {
};

function mapStateToProps(state) {
  return {
    showGettingStarted: state.deviceSettings.showGettingStarted,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    toggleShowGettingStarted: () => dispatch(deviceSettingsActions.toggleSetting('showGettingStarted')),
    importProtocolFromURI: uri => dispatch(protocolActions.importProtocolFromURI(uri)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HeaderSection);

export { HeaderSection as UnconnectedHeaderSection };
