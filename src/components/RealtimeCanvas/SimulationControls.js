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
import LayoutContext from '../../contexts/LayoutContext';
import { entityPrimaryKeyProperty, entityAttributesProperty } from '../../ducks/modules/network';
import ScreenManager from './ScreenManager';
import LayoutNode from './LayoutNode';


const SimulationControl = ({
  icon: Icon,
  onClick,
  children,
  disabled,
}) => (
  <div
    className={cx(
      'node-layout-simulation-controls__control',
      { 'node-layout-simulation-controls__control--disabled': disabled },
    )}
    onClick={onClick}
  >
    <Icon />
    {children}
  </div>
);

const SimulationControls = ({
  isSimulationEnabled,
  onReheat,
  onToggleSimulation,
  onZoomViewport,
}) => {

  return (
    <motion.div
      className="node-layout-simulation-controls"
      drag
      // dragConstraints={interfaceRef}
    >
      <Toggle
        className="node-layout-simulation-controls__enable"
        input={{
          value: isSimulationEnabled,
          onChange: onToggleSimulation,
        }}
        label="Simulation enabled"
      />
      { isSimulationEnabled && (
        <>
          <SimulationControl
            icon={AutorenewIcon}
            onClick={onReheat}
          >
            Reheat
          </SimulationControl>
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
        </>
      )}
    </motion.div>
  );
};

export default SimulationControls;
