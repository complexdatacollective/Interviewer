import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MinimizeIcon from '@material-ui/icons/Minimize';
import Prompts from './Prompts';

const CollapsablePrompts = (props) => {
  const {
    prompts,
    currentPromptIndex,
    interfaceRef,
  } = props;
  const ref = useRef(null);
  const [minimized, setMinimized] = useState(false);

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

  // Reset the minimization when the prompt changes
  useEffect(() => {
    if (minimized) {
      // There was an animation 'jank' without this additional
      // timeout. I don't like it, but 'delay' in the variants
      // didn't work :/
      setTimeout(() => setMinimized(false), 250);
    }
  }, [currentPromptIndex]);

  return (
    <motion.div
      ref={ref}
      className="sociogram-interface__prompts"
      drag
      dragConstraints={interfaceRef}
    >
      <motion.div
        className="sociogram-interface__prompts__header"
        onTap={() => setMinimized(!minimized)}
      >
        { minimized ? (
          <motion.div
            role="button"
            aria-label="Tap to show the prompt"
            style={{
              width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
          >
            <strong>Tap to show the prompt</strong>
          </motion.div>
        ) : (
          <MinimizeIcon style={{ cursor: 'hand' }} titleAccess="Minimize" />
        )}
      </motion.div>
      <motion.div
        animate={minimized ? 'minimized' : 'normal'}
        variants={variants}
      >
        <AnimatePresence initial={false}>
          { !minimized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Prompts prompts={prompts} currentPrompt={currentPromptIndex} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default CollapsablePrompts;
