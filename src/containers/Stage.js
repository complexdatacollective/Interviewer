import React from 'react';
import PropTypes from 'prop-types';

import getInterface from './Interfaces';
import StageErrorBoundary from '../components/StageErrorBoundary';

/**
  * Render a protocol interface based on protocol info and id
  * @extends Component
  */
const Stage = ({ stage, ...props }) => {
  const CurrentInterface = getInterface(stage.type);

  return (
    <div className="stage">
      <div className="stage__interface">
        <StageErrorBoundary>
          { CurrentInterface &&
            <CurrentInterface {...props} stage={stage} />
          }
        </StageErrorBoundary>
      </div>
    </div>
  );
};

Stage.propTypes = {
  stage: PropTypes.object.isRequired,
  promptId: PropTypes.number,
};

Stage.defaultProps = {
  promptId: 0,
};

export default Stage;
