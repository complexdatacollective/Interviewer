import React from 'react';
import { Icon } from '@codaco/ui';
import { motion } from 'framer-motion';

const SettingsMenuButton = () => (
  <motion.div
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    className="settings-menu-button"
  >
    <Icon name="settings" />
  </motion.div>
);

export default SettingsMenuButton;
