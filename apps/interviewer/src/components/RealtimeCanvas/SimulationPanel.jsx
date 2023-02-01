import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import LayoutContext from '../../contexts/LayoutContext';

const PauseIcon = () => { };
const PlayIcon = () => { };

const SimulationPanel = ({
  dragConstraints,
}) => {
  const {
    allowAutomaticLayout,
    simulation,
  } = useContext(LayoutContext);

  if (!allowAutomaticLayout) { return null; }

  const {
    simulationEnabled,
    toggleSimulation,
  } = simulation;

  return (
    <motion.div
      className="simulation-panel"
      drag
      dragConstraints={dragConstraints}
    >
      <motion.div
        className="simulation-panel__control"
        onTap={toggleSimulation}
      >
        <div className="simulation-panel__control-icon">
          {simulationEnabled ? <PauseIcon /> : <PlayIcon />}
        </div>
        {simulationEnabled ? 'Pause Auto Layout' : 'Resume Auto Layout'}
      </motion.div>
    </motion.div>
  );
};

SimulationPanel.propTypes = {
  dragConstraints: PropTypes.object,
};

SimulationPanel.defaultProps = {
  dragConstraints: undefined,
};

export default SimulationPanel;
