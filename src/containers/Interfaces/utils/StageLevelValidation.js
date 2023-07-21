import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@codaco/ui';
import { defaultTo } from 'lodash';

export const SelfDismissingNote = (Wrapped) => (
  {
    show,
    dontHide = false,
    onHideCallback = () => { },
    ...rest
  },
) => {
  const [visible, setVisible] = useState(show);
  useEffect(() => {
    let timeout;
    if (show) {
      setVisible(true);

      if (!dontHide) {
        timeout = setTimeout(() => {
          onHideCallback();
          setVisible(false);
        }, 4000);
      }
    }

    if (!show) {
      setVisible(false);
      clearTimeout(timeout);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [show, dontHide, onHideCallback]);

  return (
    <AnimatePresence>
      {visible && (
        <Wrapped {...rest} />
      )}
    </AnimatePresence>
  );
};

export const MaxNodesReached = SelfDismissingNote(() => (
  <motion.div
    className="alter-limit-nudge"
    style={{
      bottom: '2.4rem',
      width: '40rem',
      alignItems: 'center',
      left: 'calc(50% - 20rem)',
      animation: 'shake 1.32s cubic-bezier(.36, .07, .19, .97) both',
      animationDelay: '1s',
    }}
    initial={{ opacity: 0, y: '100%' }}
    animate={{ opacity: 1, y: 0, transition: { delay: 1, type: 'spring' } }}
    exit={{ opacity: 0, y: '100%' }}
  >
    <div
      style={{
        flex: '0 0 1.8rem',
      }}
    >
      <Icon name="info" style={{ height: '3rem', width: '3rem' }} />
    </div>
    <div
      style={{
        flex: '1 1 auto',
        margin: '0 1.8rem',
      }}
    >
      <p>
        You have added the maximum number of items. Click
        the down arrow to continue.
      </p>
    </div>
  </motion.div>
));

export const MinNodesNotMet = SelfDismissingNote(({ minNodes }) => (
  <motion.div
    className="alter-limit-nudge"
    style={{
      bottom: '2.4rem',
      width: '30rem',
      alignItems: 'center',
      left: 'calc(50% - 15rem)',
      animation: 'shake 1.32s cubic-bezier(.36, .07, .19, .97) both',
    }}
    initial={{ opacity: 0, y: '100%' }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: '100%' }}
  >
    <div
      style={{
        flex: '0 0 1.8rem',
      }}
    >
      <Icon name="error" style={{ height: '3rem', width: '3rem' }} />
    </div>
    <div
      style={{
        flex: '1 1 auto',
        margin: '0 1.8rem',
      }}
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
    </div>
  </motion.div>
));

export const minNodesWithDefault = (stageValue) => defaultTo(stageValue, 0);
export const maxNodesWithDefault = (stageValue) => defaultTo(stageValue, Infinity);
