import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { GraphicButton, Button } from '@codaco/ui';
import { Section } from '.';
import { Scroller } from '../../components';
import { ProtocolCard } from '../../components/Cards';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import ProtocolUrlForm from './ProtocolUrlForm';

const InterviewSection = (props) => {
  const {
    installedProtocols,
    pairedServer,
    showProtocolUrlForm,
    toggleShowProtocolUrlForm,
  } = props;

  const otherProtocols = Object.keys(installedProtocols).slice(1);
  const lastProtocol = installedProtocols[Object.keys(installedProtocols)[0]];
  console.log('pther', otherProtocols, installedProtocols);
  return (
    <Section className="start-screen-section interview-section">
      <ProtocolUrlForm show={showProtocolUrlForm} handleClose={toggleShowProtocolUrlForm} />
      <AnimatePresence>
        {
          Object.keys(installedProtocols).length > 0 && (
            <motion.div layout>
              <main className="interview-section__start-new">
                <div className="content-area">
                  <div className="content-area__last-used">
                    <header>
                      <h2>Start an Interview</h2>
                    </header>
                    <ProtocolCard
                      attributes={{
                        schemaVersion: lastProtocol.schemaVersion,
                        lastModified: lastProtocol.lastModified,
                        installationDate: lastProtocol.installationDate,
                        name: lastProtocol.name,
                        description: lastProtocol.description,
                      }}
                    />
                  </div>
                  {
                    Object.keys(otherProtocols).length > 0 && (
                      <div className="content-area__other">
                        <h4>Use Other Protocol</h4>
                        <Scroller>
                          <AnimatePresence>
                            {
                              otherProtocols.map((protocol, protocolUID) => {
                                const {
                                  schemaVersion,
                                  lastModified,
                                  installationDate,
                                  name,
                                  description,
                                } = installedProtocols[protocol];

                                console.log('protocol', protocol, installedProtocols[protocol]);

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
            </motion.div>
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
            onClick={toggleShowProtocolUrlForm}
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
      <footer className="interview-section__manage-protocols">
        <Button color="slate-blue">Manage Protocols...</Button>
      </footer>
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
    showProtocolUrlForm: state.ui.showProtocolUrlForm,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    toggleShowProtocolUrlForm: () => dispatch(uiActions.toggle('showProtocolUrlForm')),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(InterviewSection);

export { InterviewSection as UnconnectedInterviewSection };
