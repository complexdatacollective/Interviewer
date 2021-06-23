import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@codaco/ui';
import ExportSettings from '../../components/SettingsMenu/Sections/ExportOptions'

const ExportOptions = ({ onContinue }) => (
  <>
    <motion.main layout className="data-export-screen__main data-export-screen__session-select">
      <motion.header layout>
        <h2>Export &amp; Manage Interview Data</h2>
      </motion.header>
      <ExportSettings />
    </motion.main>
    <motion.footer layout className="data-export-screen__footer">
      <div className="action-buttons">
        <Button color="platinum" onClick={onContinue}>Create Export</Button>
      </div>
    </motion.footer>
  </>
);

export default ExportOptions;
