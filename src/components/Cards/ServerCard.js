import React from 'react';
import { motion } from 'framer-motion';
import { ServerCard as UIServerCard } from '@codaco/ui/lib/components/Cards';

const ServerCard = (props) => {
  const {
    name,
    host,
    addresses,
    handleServerCardClick,
    disabled,
  } = props;

  return (
    <motion.div
      enter={{ scale: 1 }}
      exit={{ scale: 0 }}
      layout
    >
      <UIServerCard
        name={name}
        host={host}
        addresses={addresses}
        onClickHandler={handleServerCardClick}
        disabled={disabled}
      />
    </motion.div>
  );
};

export default ServerCard;
