import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@codaco/ui';
import uuid from 'uuid';
import { defaultTo } from 'lodash';
import { FIRST_LOAD_UI_ELEMENT_DELAY } from './constants';

/**
 * Simple wrapper to add self-dismissing behaviour to a component
 * @param {*} Wrapped - Component to wrap
 * @param {*} show - Whether to show the component
 * @param {*} dontHide - Whether to hide the component after a timeout
 * @param {*} onHideCallback - Callback to run when the component is hidden
 * @param {*} timeoutDuration - How long to wait before hiding the component
 * @param {*} rest - Other props to pass to the component
 * @returns {Component} - Wrapped component
 */
export const SelfDismissingNote = (Wrapped) => (
  {
    show,
    onHideCallback = () => { },
    timeoutDuration = 4000,
    ...rest
  },
) => {
  const [visible, setVisible] = useState(show);
  const [mouseOver, setMouseOver] = useState(false);
  const timeout = useRef(null);
  const key = useRef(uuid());

  const handleHide = () => {
    if (timeoutDuration > 0) {
      setVisible(false);
      onHideCallback();
    }
  };

  useEffect(() => {
    if (show) {
      setVisible(true);
    }

    if (!show) {
      setVisible(false);
    }
  }, [show]);

  useEffect(() => {
    if (mouseOver) {
      clearTimeout(timeout.current);
    }

    if (!mouseOver && visible) {
      timeout.current = setTimeout(() => {
        handleHide();
      }, timeoutDuration);
    }
  }, [mouseOver]);

  useEffect(() => {
    if (visible) {
      if (timeoutDuration && timeoutDuration > 0) {
        timeout.current = setTimeout(() => {
          handleHide();
        }, timeoutDuration);
      }
    }

    if (!visible) {
      clearTimeout(timeout);
    }

    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, [visible, timeoutDuration, onHideCallback]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '2.4rem',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
      }}
      onClick={handleHide}
      onMouseEnter={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
    >
      <AnimatePresence>
        {visible && (
          <Wrapped key={key} {...rest} />
        )}
      </AnimatePresence>
    </div>
  );
};

const containerVariants = {
  show: (delay = 0) => ({
    opacity: 1,
    y: '0%',
    transition: {
      when: 'beforeChildren',
      delay,
    },
  }),
  hide: {
    opacity: 0,
    y: '50%',
    transition: {
      when: 'afterChildren',
    },
  },
};

const wrapperVariants = {
  show: {
    width: '36rem',
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
  hide: {
    width: '6rem',
    transition: {
      type: 'easeIn',
    },
  },
};

export const MinNodesNotMet = SelfDismissingNote(({ minNodes }) => (
  <motion.div
    className="alter-limit-nudge"
    variants={containerVariants}
    initial="hide"
    animate="show"
    exit="hide"
    key="min-nodes-not-met"
  >
    <motion.div className="alter-limit-nudge__wrapper" variants={wrapperVariants}>
      <div className="alter-limit-nudge__icon">
        <Icon name="error" />
      </div>
      <motion.div
        className="alter-limit-nudge__content"
      >
        <p>
          You must create at least
          {' '}
          <strong>
            {minNodes}
          </strong>
          {' '}
          {minNodes > 1 ? 'items' : 'item'}
          {' '}
          before you can continue.
        </p>
      </motion.div>
    </motion.div>
  </motion.div>
));

export const MaxNodesMet = SelfDismissingNote(() => (
  <motion.div
    className="alter-limit-nudge"
    variants={containerVariants}
    initial="hide"
    animate="show"
    exit="hide"
    custom={FIRST_LOAD_UI_ELEMENT_DELAY}
    key="min-nodes-not-met"
  >
    <motion.div className="alter-limit-nudge__wrapper" variants={wrapperVariants}>
      <div className="alter-limit-nudge__icon">
        <Icon name="info" />
      </div>
      <motion.div className="alter-limit-nudge__content">
        <p>
          You have added the maximum number of items for this screen. Click
          the down arrow to continue.
        </p>
      </motion.div>
    </motion.div>
  </motion.div>
));

export const minNodesWithDefault = (stageValue) => defaultTo(stageValue, 0);
export const maxNodesWithDefault = (stageValue) => defaultTo(stageValue, Infinity);
