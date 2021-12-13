/* eslint-disable no-param-reassign */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import PlayIcon from '@material-ui/icons/PlayArrowRounded';
import PauseIcon from '@material-ui/icons/PauseRounded';
import LayoutContext from '../../contexts/LayoutContext';

const PlayPauseButton = ({
  onClick,
  isPlaying,
}) => (
  <div
    className="simulation-panel__control"
    onClick={onClick}
  >
    <div className="simulation-panel__control-icon">
      {isPlaying ? <PauseIcon /> : <PlayIcon />}
    </div>
    {isPlaying ? 'Pause' : 'Play'}
  </div>
);

PlayPauseButton.propTypes = {
  onClick: PropTypes.isRequired,
  isPlaying: PropTypes.bool,
};
PlayPauseButton.defaultProps = {
  isPlaying: false,
};

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
        {simulationEnabled ? 'Pause' : 'Play'}
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
