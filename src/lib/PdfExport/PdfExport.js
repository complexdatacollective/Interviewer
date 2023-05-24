import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import ExportTable from './components/ExportTable';
import './styles/export-table.scss';

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
    };
  }, []);

  useEffect(() => {
    console.log('PdfExport mounting. Seinding PDF_READY'); // eslint-disable-line no-console
    ipcRenderer.send('PDF_READY');
  }, []);

  console.log('dataForPdf', dataForPdf); // eslint-disable-line no-console

  if (!dataForPdf) {
    return null;
  }

  return (
    <div style={{ margin: '2rem' }}>
      <h1>
        Case ID:
        {' '}
        {caseIdForPdf}
      </h1>
      <h3>
        Partner Notification
      </h3>
      <div>
        <ExportTable data={dataForPdf} />
      </div>
    </div>
  );
};

export default PdfExport;
