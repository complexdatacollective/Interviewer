import React, { useState } from 'react';
import { sortBy, values, mapValues, omit } from 'lodash';
import { withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators as sessionActions } from '../../ducks/modules/sessions';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { NewSessionOverlay, ProtocolCard } from '../../components/SetupScreen';
import { entityAttributesProperty } from '../../ducks/modules/network';

const NewInterviewSection = (props) => {
  const {
    installedProtocols,
    activeProtocol,
    addSession,
    showProtocolsOverlay,
  } = props;

  const [showNewSessionOverlay, setShowNewSessionOverlay] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(null);

  const handlePrimeSession = (protocolUID) => {
    setSelectedProtocol(protocolUID);
    setShowNewSessionOverlay(true);
  };

  const handleCloseOverlay = () => {
    setShowNewSessionOverlay(false);
    setSelectedProtocol(null);
  };


  const handleCreateSession = (caseId) => {
    addSession(caseId, selectedProtocol);

    // Close overlay
    handleCloseOverlay();
  };

  const ProtocolSelectOptions = Object.keys(installedProtocols).map(
    (protocol) => {
      return (<option key={protocol} value={protocol}>{installedProtocols[protocol].name}</option>);
    },
  );

  return (
    <section className="setup-section start-section">
      <NewSessionOverlay
        handleSubmit={handleCreateSession}
        onClose={handleCloseOverlay}
        show={showNewSessionOverlay}
      />
      <main className="section-wrapper">
        <section className="setup-section__content">
          <header>
            <h1>Start a New Interview</h1>
            <h3>Active Protocol...</h3>
          </header>
          <ProtocolCard
            attributes={installedProtocols[activeProtocol]}
            protocolUID={activeProtocol}
            onClickHandler={handlePrimeSession}
          />
        </section>
        <aside className="setup-section__action">
          {ProtocolSelectOptions.length > 1 && (
            <div className="start-section__select-protocol">
              <h4>Change Active Protocol</h4>
              <div className="form-field-container">
                <div className="form-field">
                  <select
                    name="scaleFactor"
                    className="select-css"
                    value={installedProtocols[activeProtocol.uuid]}
                    onChange={(e) => {
                      if (!e.target.value) { return; }
                      handlePrimeSession(e.target.value);
                    }}
                  >
                    <option value="">Select a protocol...</option>
                    {ProtocolSelectOptions}
                  </select>
                </div>
              </div>
            </div>
          )}
          <div className="manage-protocols">
            <h4>Add or Remove Protocols</h4>
            <div className="library-card" onClick={() => showProtocolsOverlay()}>
              <h3>Open Protocol Library...</h3>
            </div>
          </div>
        </aside>
      </main>
    </section>
  );
};

NewInterviewSection.propTypes = {
};

NewInterviewSection.defaultProps = {
};

function mapStateToProps(state) {
  const getLastActiveSession = () => {
    const sessionsCollection = values(mapValues(state.sessions, (session, sessionUUID) => { session['sessionUUID'] = sessionUUID; return session; }));
    const lastActive = sortBy(sessionsCollection, ['updatedAt'])[0];
    return {
      sessionUUID: lastActive.sessionUUID,
      [entityAttributesProperty]: {
        ...omit(lastActive, 'sessionUUID'),
      },
    };
  };

  const getActiveProtocol = () => {
    const lastActiveSession = getLastActiveSession();

    return state.ui.activeProtocolUUID
      || lastActiveSession.protocolUID
      || Object.keys(state.installedProtocols)[0];
  };

  return {
    installedProtocols: state.installedProtocols,
    sessions: state.sessions,
    lastActiveSession: getLastActiveSession(),
    activeProtocol: getActiveProtocol(),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addSession: bindActionCreators(sessionActions.addSession, dispatch),
    showProtocolsOverlay: () => dispatch(uiActions.update({ showProtocolsOverlay: true })),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NewInterviewSection));

export { NewInterviewSection as UnconnectedNewInterviewSection };
