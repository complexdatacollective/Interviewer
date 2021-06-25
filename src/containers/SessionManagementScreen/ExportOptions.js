import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@codaco/ui';
import Scroller from '../../components/Scroller';
import ExportSettings from '../../components/SettingsMenu/Sections/ExportOptions';

const ExportOptions = ({ onContinue }) => (
  <>
    <motion.header layout>
      <h1>Export Options</h1>
    </motion.header>
    <motion.main layout className="session-management-screen__main session-management-screen__session-select session-management-screen__main--scrollable">
      <Scroller>
        <motion.div layout className="content-area">
          <ExportSettings />
        </motion.div>
      </Scroller>
    </motion.main>
    <motion.footer layout className="session-management-screen__footer">
      <div />
      <div className="action-buttons">
        <Button color="platinum" onClick={onContinue}>Create Export</Button>
      </div>
    </motion.footer>
  </>
);

export default ExportOptions;
