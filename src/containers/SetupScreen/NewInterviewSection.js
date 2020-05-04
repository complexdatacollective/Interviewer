import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators as sessionActions } from '../../ducks/modules/sessions';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { actionCreators as setupScreenActions } from '../../ducks/modules/setupScreen';
import { NewSessionOverlay } from '../../components/SetupScreen';
import { ProtocolCard } from '../../components';
import { getLastActiveSession } from '../../selectors/session';
import { entityAttributesProperty } from '../../ducks/modules/network';

const NewInterviewSection = (props) => {
  const {
    installedProtocols,
    activeProtocol,
    addSession,
    showProtocolsOverlay,
    setActiveProtocol,
  } = props;

  const [showNewSessionOverlay, setShowNewSessionOverlay] = useState(false);

  const handlePrimeSession = () => {
    setShowNewSessionOverlay(true);
  };

  const handleCloseOverlay = () => {
    setShowNewSessionOverlay(false);
  };


  const handleCreateSession = (caseId) => {
    addSession(caseId, activeProtocol);

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
                    value={activeProtocol}
                    onChange={(e) => {
                      setActiveProtocol(e.target.value);
                    }}
                  >
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
  const lastActiveSession = getLastActiveSession(state);

  const getActiveProtocol = () => {
    if (state.setupScreen.activeProtocolUUID) {
      return state.setupScreen.activeProtocolUUID;
    }

    if (lastActiveSession[entityAttributesProperty].protocolUID) {
      return lastActiveSession[entityAttributesProperty].protocolUID;
    }

    return Object.keys(state.installedProtocols)[0];
  };

  return {
    installedProtocols: state.installedProtocols,
    sessions: state.sessions,
    lastActiveSession,
    activeProtocol: getActiveProtocol(),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addSession: bindActionCreators(sessionActions.addSession, dispatch),
    showProtocolsOverlay: () => dispatch(uiActions.update({ showProtocolsOverlay: true })),
    setActiveProtocol:
      protocolUUID => dispatch(setupScreenActions.update({ activeProtocolUUID: protocolUUID })),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewInterviewSection);

export { NewInterviewSection as UnconnectedNewInterviewSection };
