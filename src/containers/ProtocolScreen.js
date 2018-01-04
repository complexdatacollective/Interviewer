import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';
import { StageTransition } from '../components/Transition';
import Stage from './Stage';
import { stage as getStage } from '../selectors/session';

/**
  * Check protocol is loaded, and render the stage
  */
const Protocol = ({ isProtocolLoaded, stage }) => {
  if (!isProtocolLoaded) { return null; }

  return (
    <div className="protocol">
      <TransitionGroup>
        <StageTransition key={stage.id}>
          <Stage config={stage} />
        </StageTransition>
      </TransitionGroup>
    </div>
  );
};

Protocol.propTypes = {
  isProtocolLoaded: PropTypes.bool.isRequired,
  stage: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    isProtocolLoaded: state.protocol.isLoaded,
    stage: getStage(state),
  };
}


export default connect(mapStateToProps)(Protocol);
