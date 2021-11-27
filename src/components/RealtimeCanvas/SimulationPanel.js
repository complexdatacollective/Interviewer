/* eslint-disable no-param-reassign */
import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty, get } from 'lodash';
import cx from 'classnames';
import { motion } from 'framer-motion';
import { Toggle } from '@codaco/ui/lib/components/Fields';
import AutorenewIcon from '@material-ui/icons/AutorenewRounded';
import ZoomInIcon from '@material-ui/icons/ZoomInRounded';
import ZoomOutIcon from '@material-ui/icons/ZoomOutRounded';

const variants = {
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

const SimulationControl = ({
  icon: Icon,
  onClick,
  children,
  disabled,
}) => (
  <div
    className={cx(
      // 'accordion-item',
      'simulation-panel__control',
      { 'simulation-panel__control--disabled': disabled },
    )}
    onClick={onClick}
  >
    <div className="simulation-panel__control-icon">
      <Icon />
    </div>
    {children}
  </div>
);

const SimulationPanel = ({
  isSimulationEnabled,
  onReheat,
  onToggleSimulation,
  onZoomViewport,
  isRunning,
  dragConstraints,
}) => (
  <motion.div
    className="simulation-panel"
    drag
    dragConstraints={dragConstraints}
  >
    <motion.div
      className={cx(
        'simulation-panel__heading',
        { 'simulation-panel__heading--active': isSimulationEnabled },
      )}
    >
      <Toggle
        className="simulation-panel__enable"
        input={{
          value: isSimulationEnabled,
          onChange: onToggleSimulation,
        }}
        label="Simulation enabled"
      />
    </motion.div>
    <motion.div
      className="simulation-panel__controls"
      animate={isSimulationEnabled ? 'normal' : 'minimized'}
      variants={variants}
    >
      <SimulationControl
        icon={ZoomInIcon}
        onClick={() => onZoomViewport(1.5)}
      >
        Zoom In
      </SimulationControl>
      <SimulationControl
        icon={ZoomOutIcon}
        onClick={() => onZoomViewport(0.67)}
      >
        Zoom Out
      </SimulationControl>
      <SimulationControl
        icon={AutorenewIcon}
        onClick={onReheat}
        disabled={isRunning}
      >
        Reheat
      </SimulationControl>
    </motion.div>
  </motion.div>
);

export default SimulationPanel;
