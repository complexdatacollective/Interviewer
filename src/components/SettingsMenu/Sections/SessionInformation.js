import React from 'react';
import { connect } from 'react-redux';
import { motion } from 'framer-motion';
import { compose } from 'recompose';
import { Text } from '@codaco/ui/lib/components/Fields';
import { actionCreators as sessionsActions } from '../../../ducks/modules/sessions';
import { getCaseId, getSessionProgress } from '../../../selectors/session';
import { getActiveProtocolName } from '../../../selectors/protocol';
import TabItemVariants from './TabItemVariants';

const displayDate = timestamp => timestamp && new Date(timestamp).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
const elapsedTime = timestamp => timestamp && new Date(Date.now() - timestamp).toISOString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');

const SessionInformation = (props) => {
  const {
    caseId,
    setCaseId,
    protocolName,
    sessionProgress,
  } = props;

  return (
    <React.Fragment>
      <motion.article variants={TabItemVariants} className="settings-element--wide">
        <div>
          <h2>Case ID</h2>
          <Text
            input={{
              value: caseId,
              onChange: e => setCaseId(e.target.value),
            }}
            name="caseId"
          />
        </div>
      </motion.article>
      <motion.article variants={TabItemVariants} className="settings-element--wide">
        <div>
          <h2>Protocol</h2>
          <p>{protocolName}</p>
        </div>
      </motion.article>
      <motion.article variants={TabItemVariants} className="settings-element--wide">
        <div>
          <h2>Session Progress</h2>
          <p>Stage {sessionProgress.currentStage + 1} of {sessionProgress.screenCount}</p>
          {!!sessionProgress.promptCount &&
            <p>Prompt {sessionProgress.currentPrompt + 1} of {sessionProgress.promptCount}</p>}
        </div>
      </motion.article>
      <motion.article variants={TabItemVariants} className="settings-element--wide">
        <div>
          <h2>Session Duration</h2>
          <p>{sessionProgress.createdAt ? elapsedTime(sessionProgress.createdAt) : 'unknown'}</p>
        </div>
      </motion.article>
      <motion.article variants={TabItemVariants} className="settings-element--wide">
        <div>
          <h2>Last Exported At</h2>
          <p>{sessionProgress.lastExportedAt ? displayDate(sessionProgress.lastExportedAt) : 'never'}</p>
        </div>
      </motion.article>
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
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(SessionInformation);
