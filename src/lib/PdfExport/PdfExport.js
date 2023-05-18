import React from 'react';

const { ipcRenderer } = require('electron');

const PdfExport = () => {
  // receive sessionData via ipc
  ipcRenderer.on('SESSION_DATA', (event, sessionData) => {
    console.log('sessiondata from ipc method', sessionData);
  });

  const data = {};
  console.log('sessiondata from pdfExport', data);

  return (
    <div>
      <h2>PDF Export</h2>
    </div>
  );
};

export default PdfExport;
