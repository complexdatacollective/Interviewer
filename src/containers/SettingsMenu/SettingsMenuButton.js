import React from 'react';
import { Icon } from '@codaco/ui';
import { motion } from 'framer-motion';

const SettingsMenuButton = props => (
  <motion.div
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    className="settings-menu-button"
    {...props}
  >
    <Icon name="settings" />
  </motion.div>
);

export default SettingsMenuButton;
