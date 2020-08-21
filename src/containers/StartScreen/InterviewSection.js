import React, { useState } from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Section } from '.';
import { Scroller } from '../../components';
import { ProtocolCard, SessionCard } from '../../components/Cards';
import { actionCreators as sessionActions } from '../../ducks/modules/sessions';
import { getLastActiveSession } from '../../selectors/session';
import NewSessionOverlay from './NewSessionOverlay';
import StackButton from '../../components/StackButton';

const InterviewSection = (props) => {
  const {
    installedProtocols,
    sessions,
    lastActiveSession,
    addSession,
  } = props;

  const lastActiveProtocol = {
    ...installedProtocols[Object.keys(installedProtocols)[0]],
    protocolUID: Object.keys(installedProtocols)[0],
  };

  const [showNewSessionOverlay, setShowNewSessionOverlay] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(null);

  const handleCloseOverlay = () => {
    setShowNewSessionOverlay(false);
    setSelectedProtocol(null);
  };

  const handleCreateSession = (caseId) => {
    addSession(caseId, selectedProtocol);
    handleCloseOverlay();
  };

  const protocolCardClickHandler = (protocolUID) => {
    setShowNewSessionOverlay(true);
    setSelectedProtocol(protocolUID);
  };

  const sessionCardClickHandler = () => {};

  if (Object.keys(installedProtocols).length === 0 && Object.keys(sessions).length === 0) {
    return null;
  }

  return (
    <Section className="start-screen-section interview-section">
      <AnimatePresence>
        {
          Object.keys(installedProtocols).length > 0 && (
            <motion.div key="start-new" layout>
              <main className="interview-section__start-new">
                <div className="content-area">
                  <div className="content-area__last-used">
                    <header>
                      <h2>Start an Interview</h2>
                    </header>
                    <ProtocolCard
                      onClickHandler={
                        () => protocolCardClickHandler(lastActiveProtocol.protocolUID)
                      }
                      attributes={{
                        schemaVersion: lastActiveProtocol.schemaVersion,
                        lastModified: lastActiveProtocol.lastModified,
                        installationDate: lastActiveProtocol.installationDate,
                        name: lastActiveProtocol.name,
                        description: lastActiveProtocol.description,
                      }}
                    />
                  </div>
                  {
                    Object.keys(installedProtocols).length > 1 && (
                      <div className="content-area__other">
                        <StackButton
                          label="Select other protocol"
                          cardColor="var(--color-platinum)"
                          insetColor="var(--color-slate-blue--dark)"
                        >
                          <h3>+3 Sessions</h3>
                        </StackButton>
                      </div>
                    )
                  }
                </div>
              </main>
            </motion.div>
          )
        }
        { Object.keys(sessions).length > 0 && (
          <motion.div  key="resume-section" layout>
            <main className="interview-section__resume-section">
              <div className="content-area">
                <div className="content-area__last-session">
                  <header>
                    <h2>Resume last Interview</h2>
                  </header>
                  <SessionCard
                    onClickHandler={sessionCardClickHandler}
                    sessionUUID={lastActiveSession.sessionUUID}
                    attributes={lastActiveSession.attributes}
                  />
                </div>
                { Object.keys(sessions).length > 1 && (
                  <div className="content-area__other">
                    <StackButton
                      label="Resume other interview"
                      cardColor="var(--color-platinum)"
                      insetColor="var(--color-platinum--dark)"
                    >
                      <h3>+3 Sessions</h3>
                    </StackButton>
                  </div>
                )}
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
      <NewSessionOverlay
        handleSubmit={handleCreateSession}
        onClose={handleCloseOverlay}
        show={showNewSessionOverlay}
      />
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
    showProtocolUrlForm: state.ui.showProtocolUrlForm,
    sessions: state.sessions,
    lastActiveSession: getLastActiveSession(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addSession: (caseId, protocol) => dispatch(sessionActions.addSession(caseId, protocol)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(InterviewSection);

export { InterviewSection as UnconnectedInterviewSection };
