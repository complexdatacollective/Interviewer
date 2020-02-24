import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@codaco/ui';

const CloseButton = props => (
  <motion.div
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    {...props}
  >
    <Icon name="close" />
  </motion.div>
);

export default CloseButton;