import React, { useState } from 'react';
import { GraphicButton } from '@codaco/ui';
import Section from './Section';
import DataExportScreen from '../DataExportScreen';
import exportFilesIcon from '../../images/undraw_export_files.svg';

const DataExportSection = () => {
  const [showExport, setShowExport] = useState(true);

  const openExport = () => setShowExport(true);
  const closeExport = () => setShowExport(false);

  return (
    <>
      <Section className="start-screen-section data-export-section">
        <main className="data-export-section__main">
          <header>
            <h2>Manage and export sessions</h2>
          </header>
          <div className="content-buttons">
            <GraphicButton
              color="mustard"
              onClick={openExport}
              graphicSize="10.5rem"
              graphicPosition="5% 0%"
              graphic={exportFilesIcon}
            >
              <h3>Session</h3>
              <h2>Export</h2>
            </GraphicButton>
          </div>
        </main>
      </Section>
      <DataExportScreen show={showExport} onClose={closeExport} />
    </>
  );
};

export default DataExportSection;
