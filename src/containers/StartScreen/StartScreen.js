import React from 'react';
import { motion, AnimateSharedLayout } from 'framer-motion';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { GraphicButton } from '@codaco/ui';
import { Scroller } from '../../components';
import { ProtocolCard } from '../../components/Cards';

import {
  ResumeSessionSection,
  HeaderSection,
  // FooterNavigation,
  // ProtocolsOverlay,
  // SessionsOverlay,
} from '.';

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
          <HeaderSection />
          <motion.section variants={springy} layout className="start-screen-section interview-section">
            <main className="interview-section__start-new">
              <div className="content-area">
                <div className="content-area__last-used">
                  <header>
                    <h2>New Interview...</h2>
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
                  <h4>Select other Protocol...</h4>
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
          <ResumeSessionSection />
          <motion.section layout className="start-screen-section server-section">
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
