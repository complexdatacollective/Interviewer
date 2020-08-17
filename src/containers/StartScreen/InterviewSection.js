import React from 'react';
import { connect } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import { GraphicButton } from '@codaco/ui';
import { Section } from '.';
import { Scroller } from '../../components';
import { ProtocolCard } from '../../components/Cards';

const InterviewSection = (props) => {
  const {
    installedProtocols,
    pairedServer
  } = props;

  const otherProtocols = Object.keys(installedProtocols).slice(1);

  return (
    <Section className="start-screen-section interview-section">
      <AnimatePresence>
        {
          Object.keys(installedProtocols).length > 0 && (
            <main className="interview-section__start-new">
              <div className="content-area">
                <div className="content-area__last-used">
                  <header>
                    <h2>Start an Interview...</h2>
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
                {
                  otherProtocols.length > 0 && (
                    <div className="content-area__other">
                      <h4>Use Other Protocol...</h4>
                      <Scroller>
                        <AnimatePresence>
                          {
                            Object.keys(otherProtocols).map((protocolUID) => {
                              const {
                                schemaVersion,
                                lastModified,
                                installationDate,
                                name,
                                description,
                              } = installedProtocols[protocolUID];

                              return (
                                <ProtocolCard
                                  key={protocolUID}
                                  condensed
                                  attributes={{
                                    schemaVersion,
                                    lastModified,
                                    installationDate,
                                    name,
                                    description,
                                  }}
                                />
                              );
                            })
                          }
                        </AnimatePresence>
                      </Scroller>
                    </div>
                  )
                }
              </div>
            </main>
          )
        }
      </AnimatePresence>
      <main className="interview-section__install-section">
        <header>
          <h2>Import a Protocol</h2>
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
          {
            pairedServer && (
              <GraphicButton
                color="mustard"
              >
                <h3>Import</h3>
                <h2>From Server</h2>
              </GraphicButton>
            )
          }
        </div>
      </main>
    </Section>
  );
};

InterviewSection.propTypes = {
};

InterviewSection.defaultProps = {
};

function mapStateToProps(state) {
  return {
    installedProtocols: state.installedProtocols,
    paredServer: state.pairedServer,
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(InterviewSection);

export { InterviewSection as UnconnectedInterviewSection };
