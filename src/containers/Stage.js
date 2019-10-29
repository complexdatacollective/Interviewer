import React from 'react';
import PropTypes from 'prop-types';

import getInterface from './Interfaces';
import StageErrorBoundary from '../components/StageErrorBoundary';

/**
  * Render a protocol interface based on protocol info and id
  * @extends Component
  */
const Stage = React.forwardRef(({ stage, promptId, stageIndex, onComplete }, ref) => {
  const CurrentInterface = getInterface(stage.type);

  let interfaceRef = ref;
  // can't pass a ref to a stateless component
  if (!CurrentInterface.prototype.render) {
    interfaceRef = null;
  }

  return (
    <div className="stage">
      <div className="stage__interface">
        <StageErrorBoundary>
          { CurrentInterface &&
            <CurrentInterface
              stage={stage}
              stageIndex={stageIndex}
              promptId={promptId}
              ref={interfaceRef}
              onComplete={onComplete}
            />
          }
        </StageErrorBoundary>
      </div>
    </div>
  );
});

Stage.propTypes = {
  stage: PropTypes.object.isRequired,
  promptId: PropTypes.number,
};

Stage.defaultProps = {
  promptId: 0,
};

export default Stage;
