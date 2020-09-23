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
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
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
