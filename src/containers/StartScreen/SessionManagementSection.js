import React, { useState } from 'react';
import { GraphicButton } from '@codaco/ui';
import Section from './Section';
import SessionManagementScreen, { MODES } from '../SessionManagementScreen';
import exportIcon from '../../images/undraw_export_files.svg';
import manageIcon from '../../images/undraw_file_manager.svg';

const SessionManagementSection = () => {
  const [showSessionManagement, setShowSessionManagement] = useState(false);

  const openExport = () => setShowSessionManagement(MODES.export);
  const openManage = () => setShowSessionManagement(MODES.manage);
  const closeSessionManagement = () => setShowSessionManagement(false);

  return (
    <>
      <Section className="start-screen-section data-export-section">
        <main className="data-export-section__main">
          <header>
            <h2>Manage and export sessions</h2>
          </header>
          <div className="content-buttons">
            <GraphicButton
              color="mustard--dark"
              onClick={openExport}
              graphicSize="10.5rem"
              graphicPosition="5% 0%"
              graphic={exportIcon}
            >
              <h3>Session</h3>
              <h2>Export</h2>
            </GraphicButton>
            <GraphicButton
              color="charcoal"
              onClick={openManage}
              graphicSize="12rem"
              graphicPosition="5% 100%"
              graphic={manageIcon}
            >
              <h3>Session</h3>
              <h2>Management</h2>
            </GraphicButton>
          </div>
        </main>
      </Section>
      <SessionManagementScreen
        show={!!showSessionManagement}
        onClose={closeSessionManagement}
        mode={showSessionManagement}
      />
    </>
  );
};

export default SessionManagementSection;
