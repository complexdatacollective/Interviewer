import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';
import { Stage as StageTransition } from '../components/Transition';
import Stage from './Stage';
import { stage as getStage } from '../selectors/session';

/**
  * Check protocol is loaded, and render the stage
  */
const Protocol = ({ isProtocolLoaded, protocolPath, stage }) => {
  if (!isProtocolLoaded) { return null; }

  return (
    <div className="protocol">
      <TransitionGroup>
        <StageTransition key={stage.id}>
          <Stage config={stage} pathPrefix={`/protocol/${protocolPath}`} />
        </StageTransition>
      </TransitionGroup>
    </div>
  );
};

Protocol.propTypes = {
  isProtocolLoaded: PropTypes.bool.isRequired,
  protocolPath: PropTypes.string,
  stage: PropTypes.object.isRequired,
};

Protocol.defaultProps = {
  protocolPath: '',
};

function mapStateToProps(state) {
  return {
    isProtocolLoaded: state.protocol.isLoaded,
    protocolPath: state.protocol.path,
    stage: getStage(state),
  };
}


export default connect(mapStateToProps)(Protocol);
