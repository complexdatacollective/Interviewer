/* eslint-disable no-param-reassign */
import React, {
  useRef,
  useState,
  useContext,
  useCallback,
  useReducer,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { motion, useDragControls } from 'framer-motion';
import { debounce } from 'lodash';
import Toggle from '@codaco/ui/lib/components/Fields/Toggle';
import AutorenewIcon from '@material-ui/icons/AutorenewRounded';
import ZoomInIcon from '@material-ui/icons/ZoomInRounded';
import ZoomOutIcon from '@material-ui/icons/ZoomOutRounded';
import MinimizeIcon from '@material-ui/icons/MinimizeRounded';
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

const controlVariants = {
  disabled: {
    height: 0,
    transition: {
    },
  },
  enabled: {
    height: 'auto',
    transition: {
      when: 'afterChildren',
    },
  },
};

const ButtonControl = ({
  icon: Icon,
  onClick,
  label,
  disabled,
}) => (
  <div
    className={cx(
      'simulation-panel__control',
      { 'simulation-panel__control--disabled': disabled },
    )}
    onClick={() => {
      if (disabled) { return; }
      onClick();
    }}
  >
    <div className="simulation-panel__control-icon">
      <Icon />
    </div>
    {label}
  </div>
);

ButtonControl.propTypes = {
  icon: PropTypes.any.isRequired,
  onClick: PropTypes.isRequired,
  label: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};
ButtonControl.defaultProps = {
  disabled: false,
};

const SliderControl = ({
  value,
  label,
  min,
  max,
  name,
  disabled,
  onChange,
}) => {
  const unit = (max - min) / 1000;
  const displayValue = Math.round((value - min) / unit);

  const handleChange = useCallback((e) => {
    const { target } = e;
    const newValue = min + (parseFloat(target.value) * unit);
    onChange(newValue, name, e);
  }, [unit, name, min]);

  return (
    <div
      className={cx(
        'simulation-panel__control',
        { 'simulation-panel__control--disabled': disabled },
      )}
    >
      {label}
      <br />
      <input
        type="range"
        name={name}
        min={0}
        max={1000}
        value={displayValue}
        onChange={handleChange}
      />
    </div>
  );
};

SliderControl.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  value: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

SliderControl.defaultProps = {
  min: 0,
  max: 100,
  disabled: false,
};

const optionsReducer = (state, { type, payload }) => {
  switch (type) {
    case 'UPDATE':
      return {
        ...state,
        [payload.option]: payload.value,
      };
    default:
      return state;
  }
};

const useDebouncedEffect = (func, wait, deps) => {
  const currentFunc = useRef(null);
  const debouncedFunc = useRef(debounce(() => { currentFunc.current(); }, wait));
  useEffect(() => {
    if (!currentFunc.current) { // skip first run
      currentFunc.current = func;
      return;
    }
    currentFunc.current = func;
    debouncedFunc.current();
  }, deps);
};

const initialOptions = {
  decay: 0.1,
  charge: -30,
  linkForce: 1,
  linkDistance: 30,
  center: 0.1,
};

const SimulationPanel = ({
  dragConstraints,
}) => {
  const {
    viewport,
    allowSimulation,
    simulation,
  } = useContext(LayoutContext);

  const {
    updateOptions,
    reheat,
    isRunning,
    simulationEnabled,
    toggleSimulation,
  } = simulation;

  const [isMinimized, setMinimized] = useState(false);
  const dragControls = useDragControls();

  const [options, optionsAction] = useReducer(optionsReducer, initialOptions);

  const toggleMinimize = () => setMinimized((minimized) => !minimized);

  const handleStartDrag = useCallback((event) => {
    dragControls.start(event);
  }, [dragControls]);

  const handleChangeSlider = useCallback((value, option) => {
    optionsAction({
      type: 'UPDATE',
      payload: {
        option,
        value,
      },
    });
  }, [optionsAction]);

  useDebouncedEffect(() => {
    updateOptions(options);
  }, 50, [options]);

  if (!allowSimulation) { return null; }

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
          <Toggle
            className="simulation-panel__enable-toggle"
            input={{
              value: simulationEnabled,
              onChange: toggleSimulation,
            }}
            label="Simulation enabled"
          />
        </motion.div>
        <motion.div
          className="simulation-panel__controls"
          animate={simulationEnabled ? 'enabled' : 'disabled'}
          variants={controlVariants}
        >
          <ButtonControl
            icon={ZoomInIcon}
            onClick={() => viewport.zoomViewport(1.5)}
            label="Zoom In"
          />
          <ButtonControl
            icon={ZoomOutIcon}
            onClick={() => viewport.zoomViewport(0.67)}
            label="Zoom Out"
          />
          <ButtonControl
            icon={AutorenewIcon}
            onClick={reheat}
            disabled={isRunning}
            label="Reheat"
          />
          {/* Stay hot */}
          <SliderControl
            label="velocity decay"
            name="decay"
            value={options.decay}
            onChange={handleChangeSlider}
            min={0}
            max={1}
          />
          <SliderControl
            label="Charge strength"
            name="charge"
            value={options.charge}
            onChange={handleChangeSlider}
            min={-50}
            max={0}
          />
          <SliderControl
            label="Link distance"
            name="linkDistance"
            value={options.linkDistance}
            onChange={handleChangeSlider}
            min={0}
            max={30}
          />
          <SliderControl
            label="Center strength"
            name="center"
            value={options.center}
            onChange={handleChangeSlider}
            min={0}
            max={1}
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
