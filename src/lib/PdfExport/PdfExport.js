import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import ExportTable from './components/ExportTable';
import './styles/export-table.scss';

const { writeFile } = require('fs-extra');

const PdfExport = () => {
  const [dataForPdf, setDataForPdf] = useState(null);
  const [caseIdForPdf, setCaseIdForPdf] = useState(null);

  useEffect(() => {
    // receive sessionData via ipc
    ipcRenderer.on('PDF_DATA', (_, sessionData, caseId) => {
      console.log('ipcRenderer.on(PDF_DATA)', sessionData, caseId); // eslint-disable-line no-console
      setDataForPdf(sessionData);
      setCaseIdForPdf(caseId);
    });

    return () => {
      console.log('PdfExport unmounting'); // eslint-disable-line no-console
      ipcRenderer.removeAllListeners('PDF_DATA');
      ipcRenderer.removeAllListeners('READY_TO_PRINT');
    };
  }, []);

  useEffect(() => {
    console.log('PdfExport mounting. Sending PDF_READY'); // eslint-disable-line no-console
    ipcRenderer.send('PDF_READY');
  }, []);

  console.log('dataForPdf', dataForPdf); // eslint-disable-line no-console

  if (!dataForPdf) {
    return null;
  }

  return (
    <div style={{ margin: '2rem' }}>
      <h1 style={{ color: 'rgb(109, 111, 118)' }}>
        Case ID:
        {' '}
        {caseIdForPdf}
      </h1>
      <h3 style={{ color: 'rgb(109, 111, 118)' }}>
        Partner Notification
      </h3>
      <div>
        <ExportTable data={dataForPdf} />
      </div>
    </div>
  );
};

export default PdfExport;
