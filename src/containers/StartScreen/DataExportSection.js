import React, { useState } from 'react';
import { Button } from '@codaco/ui';
import Section from './Section';
import DataExportScreen from '../DataExportScreen';

const DataExportSection = () => {
  const [showExport, setShowExport] = useState(true);

  const openExport = () => setShowExport(true);
  const closeExport = () => setShowExport(false);

  return (
    <Section className="start-screen-section data-export-section">
      <Button onClick={openExport}>Export</Button>
      <DataExportScreen show={showExport} onClose={closeExport} />
    </Section>
  );
};

export default DataExportSection;
