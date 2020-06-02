import React, { useState } from 'react';
import { countBy } from 'lodash';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Text } from '@codaco/ui/lib/components/Fields';
import { Node, Icon, Button } from '@codaco/ui';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { getCaseId, getSessionProgress } from '../../selectors/session';
import { getActiveProtocolName, getProtocolCodebook } from '../../selectors/protocol';
import { getNetwork } from '../../selectors/network';
import { Scroller } from '..';
import { Overlay } from '../../containers/Overlay';

const elapsedTime = timestamp => timestamp && new Date(Date.now() - timestamp).toISOString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');


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
      return '';
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
          <h6>{sessionCodebook[codebookType][entity].name} ({networkEntitiesByType[entity]})</h6>
        </div>
      );
    });
  };

  const [newCaseID, setNewCaseID] = useState(caseId);
  const [showCaseIDRename, setShowCaseIDRename] = useState(false);

  const handleChangeCaseID = () => {
    setCaseId(newCaseID);
    setShowCaseIDRename(false);
  };

  return (
    <React.Fragment>
      <Overlay
        show={showCaseIDRename}
        onClose={() => setShowCaseIDRename(false)}
        title="Change Case ID"
      >
        <p>
          Enter a new case ID for this interview.
        </p>
        <Text
          input={{
            value: newCaseID,
            onChange: e => setNewCaseID(e.target.value),
          }}
          meta={{
            invalid: 'this is a thing',
            touched: true,
          }}
          autoFocus
          name="caseId"
        />
        <Button onClick={handleChangeCaseID}>
          Change Case ID
        </Button>
      </Overlay>
      <Scroller>
        <section>
          <h4>Interview Duration</h4>
          <h1 className="session-duration">{sessionProgress.createdAt ? elapsedTime(sessionProgress.createdAt) : 'unknown'}</h1>
        </section>
        <section>
          <h4>Case ID</h4>
          <h2 className="case-id" onClick={() => setShowCaseIDRename(true)}>{caseId} <Icon name="edit" /></h2>
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
    </React.Fragment>

  );
};

const mapDispatchToProps = dispatch => ({
  setCaseId: name => dispatch(sessionsActions.updateCaseId(name)),
});

const mapStateToProps = (state, props) => ({
  caseId: getCaseId(state, props),
  sessionProgress: getSessionProgress(state, props),
  protocolName: getActiveProtocolName(state, props),
  sessionNetwork: getNetwork(state, props),
  sessionCodebook: getProtocolCodebook(state, props),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(SessionInformation);
