import React from 'react';
import { motion } from 'framer-motion';
import TabItemVariants from './TabItemVariants';

const ExportOptions = () => (
  <React.Fragment>
    <motion.article variants={TabItemVariants} className="settings-element--wide">
      <div>
        <h2>Export Options</h2>
        <p>This is the name that your device will appear as when paring with Server.</p>
      </div>
    </motion.article>
  </React.Fragment>
);

export default ExportOptions;
