import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';
import { Stage as StageTransition } from '../components/Transition';
import Stage from './Stage';
import { stages } from '../selectors/session';

/**
  * Check protocol is loaded, and render the stage
  */
const Protocol = (
  { isProtocolLoaded, protocolPath, protocolType, sessionId, stage, stageIndex },
) => {
  if (!isProtocolLoaded) { return null; }

  return (
    <div className="protocol">
      <TransitionGroup>
        <StageTransition key={stage.id}>
          <Stage config={stage} pathPrefix={`/session/${sessionId}/${protocolType}/${protocolPath}`} stageIndex={stageIndex} />
        </StageTransition>
      </TransitionGroup>
    </div>
  );
};

Protocol.propTypes = {
  isProtocolLoaded: PropTypes.bool.isRequired,
  protocolPath: PropTypes.string,
  protocolType: PropTypes.string.isRequired,
  sessionId: PropTypes.string.isRequired,
  stage: PropTypes.object.isRequired,
  stageIndex: PropTypes.number,
};

Protocol.defaultProps = {
  protocolPath: '',
  stageIndex: 0,
};

function mapStateToProps(state, ownProps) {
  return {
    isProtocolLoaded: state.protocol.isLoaded,
    protocolPath: state.protocol.path,
    protocolType: state.protocol.type,
    sessionId: state.session,
    stage: stages(state)[ownProps.stageIndex] || {},
    stageIndex: Math.trunc(ownProps.stageIndex) || 0,
  };
}


export default connect(mapStateToProps)(Protocol);
