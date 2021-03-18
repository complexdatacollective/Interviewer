import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Section from './Section';
import { ProtocolCard, SessionCard } from '../../components/Cards';
import { actionCreators as sessionActions } from '../../ducks/modules/sessions';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { getLastActiveSession } from '../../selectors/session';
import { getLastActiveProtocol } from '../../selectors/protocol';
import NewSessionOverlay from './NewSessionOverlay';
import StackButton from '../../components/StackButton';
import ResumeSessionPicker from './ResumeSessionPicker';
import StartInterviewPicker from './StartInterviewPicker';

const InterviewSection = () => {
  const installedProtocols = useSelector((state) => state.installedProtocols);
  const sessions = useSelector((state) => state.sessions);

  const lastActiveSession = useSelector((state) => getLastActiveSession(state));
  const lastActiveProtocol = useSelector((state) => getLastActiveProtocol(state));

  const dispatch = useDispatch();
  const addSession = (caseId, protocol) => dispatch(sessionActions.addSession(caseId, protocol));
  const toggleUIOverlay = (overlay) => dispatch(uiActions.toggle(overlay));

  const showResumeSessionPicker = useSelector((state) => state.ui.showResumeSessionPicker);
  const showStartInterviewPicker = useSelector((state) => state.ui.showStartInterviewPicker);

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
                      <h2>Start a New Interview</h2>
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
                          label="Select protocol"
                          cardColor="var(--color-platinum)"
                          insetColor="var(--color-slate-blue--dark)"
                          clickHandler={() => toggleUIOverlay('showStartInterviewPicker')}
                        >
                          <h4>
                            {
                              (Object.keys(installedProtocols).length - 1) > 1 ? `+${Object.keys(installedProtocols).length - 1} Other Protocols` : `+${Object.keys(installedProtocols).length - 1} Other Protocol`
                            }
                          </h4>
                        </StackButton>
                      </div>
                    )
                  }
                </div>
              </main>
              <StartInterviewPicker
                show={showStartInterviewPicker}
                onClose={() => toggleUIOverlay('showStartInterviewPicker')}
              />
              <NewSessionOverlay
                handleSubmit={handleCreateSession}
                onClose={handleCloseOverlay}
                show={showNewSessionOverlay}
              />
            </motion.div>
          )
        }
        { Object.keys(sessions).length > 0 && (
          <motion.div key="resume-section" layout>
            <main className="interview-section__resume-section">
              <div className="content-area">
                <div className="content-area__last-session">
                  <header>
                    <h2>Resume Last Interview</h2>
                  </header>
                  <SessionCard
                    sessionUUID={lastActiveSession.sessionUUID}
                    attributes={lastActiveSession.attributes}
                  />
                </div>
                { Object.keys(sessions).length > 1 && (
                  <div className="content-area__other">
                    <StackButton
                      label="Select interview"
                      cardColor="var(--color-platinum)"
                      insetColor="var(--color-platinum--dark)"
                      clickHandler={() => toggleUIOverlay('showResumeSessionPicker')}
                    >
                      <h4>
                        {
                          (Object.keys(sessions).length - 1) > 1 ? `+${Object.keys(sessions).length - 1} Other Interviews` : `+${Object.keys(sessions).length - 1} Other Interview`
                        }
                      </h4>
                    </StackButton>
                  </div>
                )}
              </div>
            </main>
            <ResumeSessionPicker
              show={showResumeSessionPicker}
              onClose={() => toggleUIOverlay('showResumeSessionPicker')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
};

export default InterviewSection;
