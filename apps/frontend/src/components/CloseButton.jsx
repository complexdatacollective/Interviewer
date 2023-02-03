import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@codaco/ui';

const CloseButton = (props) => (
  <motion.div
    id="close-button"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    style={{ cursor: 'pointer' }}
    {...props}
  >
    <Icon name="close" />
  </motion.div>
);

export default CloseButton;
