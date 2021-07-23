import React, { useState } from 'react';
import { countBy } from 'lodash';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import {
  Node,
  Icon,
  Button,
  Scroller,
} from '@codaco/ui';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { getCaseId, getSessionProgress } from '../../selectors/session';
import { getActiveProtocolName, getProtocolCodebook } from '../../selectors/protocol';
import { getNetwork } from '../../selectors/network';
import { Overlay } from '../../containers/Overlay';
import Form from '../../containers/Form';
import useInterval from '../../hooks/useInterval';

const elapsedTime = (timestamp) => timestamp && new Date(Date.now() - timestamp).toISOString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');

const SessionInformation = (props) => {
  const {
    caseId,
    setCaseId,
    sessionProgress,
    sessionNetwork,
    sessionCodebook,
  } = props;

  const renderSummaryEntities = (type) => {
    if (sessionNetwork[type].length === 0) {
      return (
        <h6>
          No
          {' '}
          {type}
          {' '}
          in this interview.
        </h6>
      );
    }

    const networkEntitiesByType = countBy(sessionNetwork[type], 'type');

    return Object.keys(networkEntitiesByType).map((entity) => {
      const codebookType = type === 'nodes' ? 'node' : 'edge';

      if (type === 'nodes') {
        return (
          <div className="entity-summary" key={entity}>
            <Node
              color={sessionCodebook[codebookType][entity].color}
              label={`${networkEntitiesByType[entity]}`}
            />
            <h6>{sessionCodebook[codebookType][entity].name}</h6>
          </div>
        );
      }

      return (
        <div className="entity-summary" key={entity}>
          <Icon
            color={sessionCodebook[codebookType][entity].color}
            name="links"
          />
          <h6>
            {sessionCodebook[codebookType][entity].name}
            {' '}
            (
            {networkEntitiesByType[entity]}
            )
          </h6>
        </div>
      );
    });
  };

  const [interviewDuration, setInterviewDuration] = useState(sessionProgress.startedAt ? elapsedTime(sessionProgress.startedAt) : 'Unknown');

  if (sessionProgress.startedAt) {
    useInterval(() => {
      setInterviewDuration(elapsedTime(sessionProgress.startedAt));
    }, 1000);
  }

  const [showCaseIDRename, setShowCaseIDRename] = useState(false);

  const handleChangeCaseID = ({ newCaseID }) => {
    setCaseId(newCaseID);
    setShowCaseIDRename(false);
  };

  return (
    <>
      <Overlay
        show={showCaseIDRename}
        onClose={() => setShowCaseIDRename(false)}
        title="Change Case ID"
        className="case-id-form-overlay"
        forceDisableFullscreen
      >
        <div className="case-id-form">
          <p>
            Enter a new case ID for this interview.
          </p>
          <Form
            form="case-id-form"
            formName="case-id-form"
            autoFocus
            onSubmit={handleChangeCaseID}
            fields={[
              {
                label: null,
                name: 'newCaseID',
                component: 'Text',
                placeholder: 'Enter a unique case ID',
                validation: {
                  required: true,
                  maxLength: 30,
                },
              },
            ]}
            initialValues={{
              newCaseID: caseId,
            }}
          >
            <div className="case-id-form__footer">
              <Button aria-label="Submit" type="submit">
                Update Case ID
              </Button>
            </div>
          </Form>
        </div>
      </Overlay>
      <Scroller>
        <section>
          <h4>Interview Duration</h4>
          <h1 className="session-duration">{interviewDuration}</h1>
        </section>
        <section>
          <h4>Case ID</h4>
          <h2 className="case-id">
            {caseId}
            {' '}
            <Button size="small" icon="edit" color="platinum--dark" onClick={() => setShowCaseIDRename(true)}>Edit</Button>
          </h2>
        </section>
        <section>
          <h4>Nodes</h4>
          <div>
            {renderSummaryEntities('nodes')}
          </div>

        </section>
        <section>
          <h4>Edges</h4>
          <div>
            {renderSummaryEntities('edges')}
          </div>
        </section>
      </Scroller>
    </>

  );
};

const mapDispatchToProps = (dispatch) => ({
  setCaseId: (name) => dispatch(sessionsActions.updateCaseId(name)),
});

const mapStateToProps = (state, props) => ({
  caseId: getCaseId(state, props),
  sessionProgress: getSessionProgress(state, props),
  protocolName: getActiveProtocolName(state, props),
  sessionNetwork: getNetwork(state, props),
  sessionCodebook: getProtocolCodebook(state, props),
});

export { SessionInformation };

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(SessionInformation);
