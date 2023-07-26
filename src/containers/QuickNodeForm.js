import React, {
  useState, useMemo, useEffect, useRef,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionButton, Node } from '@codaco/ui';
import { createPortal } from 'react-dom';
import { FIRST_LOAD_UI_ELEMENT_DELAY } from './Interfaces/utils/constants';

const buttonVariants = {
  show: {
    opacity: 1,
    x: '0px',
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 20,
    },
  },
  hide: {
    opacity: 0,
    x: '10rem',
  },

};

const inputVariants = {
  show: {
    opacity: 1,
    x: '0px',
    width: '25rem',
    transition: {
      delay: 0.2,
    },
  },
  hide: {
    opacity: 0,
    x: '4rem',
    width: '10rem',
  },
};

const QuickAddForm = ({
  disabled,
  icon,
  nodeColor,
  nodeType,
  addNode,
  newNodeModelData,
  newNodeAttributeData,
  targetVariable,
}) => {
  const [showForm, setShowForm] = useState(false);
  const tooltipTimer = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [nodeLabel, setNodeLabel] = useState('');

  const handleBlur = () => {
    setNodeLabel('');
    setShowForm(false);
  };

  // Handle showing/hiding the tooltip based on the nodeLabel
  // Logic: wait 5 seconds after the user last typed something
  useEffect(() => {
    if (nodeLabel !== '') {
      setShowTooltip(false);
      clearTimeout(tooltipTimer.current);
      tooltipTimer.current = setTimeout(() => {
        setShowTooltip(true);
      }, 5000);
    } else {
      setShowTooltip(false);
      clearTimeout(tooltipTimer.current);
    }
  }, [nodeLabel]);

  const isValid = useMemo(() => nodeLabel !== '', [nodeLabel]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isValid && !disabled) {
      addNode(
        newNodeModelData,
        {
          ...newNodeAttributeData,
          [targetVariable]: nodeLabel,
        },
      );

      setNodeLabel('');
    }
  };

  useEffect(() => {
    if (disabled) {
      setShowForm(false);
      setNodeLabel('');
    }
  }, [disabled]);

  return createPortal(
    <motion.div
      initial={{
        opacity: 0,
        y: '100%',
      }}
      animate={{
        opacity: 1,
        y: '0rem',
        transition: {
          delay: FIRST_LOAD_UI_ELEMENT_DELAY,
        },
      }}
      className="flip-form"
    >
      <AnimatePresence initial={false}>
        {showForm && (
          <motion.div
            key="form-container"
            className="form-container"
            initial={buttonVariants.hide}
            animate={buttonVariants.show}
            exit={buttonVariants.hide}
          >
            <form autoComplete="off" onSubmit={handleSubmit}>
              <motion.div
                key="tool-tip"
                className="tool-tip"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: showTooltip ? 1 : 0,
                }}
              >
                <span>
                  Press enter to add...
                </span>
              </motion.div>
              <motion.input
                initial={inputVariants.hide}
                animate={inputVariants.show}
                exit={inputVariants.hide}
                className="label-input"
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                onChange={(e) => setNodeLabel(e.target.value)}
                onBlur={handleBlur}
                placeholder="Type a label and press enter..."
                value={nodeLabel}
                type="text"
              />
            </form>
            <Node
              label={nodeLabel}
              selected={isValid}
              color={nodeColor}
              onClick={handleSubmit}
            />
          </motion.div>
        )}
        {!showForm && (
          <motion.div
            key="button-container"
            className="button-container"
            initial={buttonVariants.hide}
            animate={buttonVariants.show}
            exit={buttonVariants.hide}
          >
            <ActionButton
              disabled={disabled}
              onClick={() => !disabled && setShowForm(true)}
              icon={icon}
              title={`Add ${nodeType}...`}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>,
    document.body,
  );
};

export default QuickAddForm;
