import React from 'react';
import Scroller from '@codaco/ui/lib/components/Scroller';
import ExportSettings from '../../components/SettingsMenu/Sections/ExportOptions';

const ExportOptions = () => (
  <Scroller>
    <div style={{
      width: '65rem',
      margin: '0 auto',
    }}
    >
      <ExportSettings />
    </div>
  </Scroller>
);

export default ExportOptions;
