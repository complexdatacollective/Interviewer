import React from 'react';
import Scroller from '../../components/Scroller';
import ExportSettings from '../../components/SettingsMenu/Sections/ExportOptions';

const ExportOptions = () => (
  <Scroller>
    <div style={{
      width: '60rem',
    }}
    >
      <ExportSettings />
    </div>
  </Scroller>
);

export default ExportOptions;
