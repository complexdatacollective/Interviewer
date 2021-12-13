/* eslint-disable no-param-reassign */
import React, {
  useState,
  useContext,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { motion, useDragControls } from 'framer-motion';
import MinimizeIcon from '@material-ui/icons/MinimizeRounded';
import PlayIcon from '@material-ui/icons/PlayArrowRounded';
import PauseIcon from '@material-ui/icons/PauseRounded';
import LayoutContext from '../../contexts/LayoutContext';

const panelVariants = {
  minimized: {
    height: 0,
    transition: {
    },
  },
  normal: {
    height: 'auto',
    transition: {
      when: 'afterChildren',
    },
  },
};

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

  const [isMinimized, setMinimized] = useState(false);
  const dragControls = useDragControls();

  const toggleMinimize = () => setMinimized((minimized) => !minimized);

  const handleStartDrag = useCallback((event) => {
    dragControls.start(event);
  }, [dragControls]);

  if (!allowAutomaticLayout) { return null; }

  const {
    simulationEnabled,
    toggleSimulation,
  } = simulation;

  return (
    <motion.div
      className="simulation-panel"
      drag
      dragControls={dragControls}
      dragConstraints={dragConstraints}
      dragListener={false}
    >
      <motion.div
        className="simulation-panel__header"
        onTap={toggleMinimize}
        onPointerDown={handleStartDrag}
      >
        { isMinimized ? (
          <motion.div
            role="button"
            aria-label="Tap to show simulation controls"
            className="simulation-panel__header-open-prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
          >
            <strong>Tap to show simulation controls</strong>
          </motion.div>
        ) : (
          <MinimizeIcon className="simulation-panel__header-minimize" titleAccess="Minimize" />
        )}
      </motion.div>
      <motion.div
        className="simulation-panel__controls"
        animate={isMinimized ? 'minimized' : 'normal'}
        variants={panelVariants}
      >
        <motion.div
          className={cx(
            'simulation-panel__enable',
            { 'simulation-panel__enable--active': simulationEnabled },
          )}
        >
          <PlayPauseButton
            isPlaying={simulationEnabled}
            onClick={toggleSimulation}
          />
        </motion.div>
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
