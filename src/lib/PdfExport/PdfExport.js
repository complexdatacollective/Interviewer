/* eslint-disable @codaco/spellcheck/spell-checker */
import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import ExportTable from './components/ExportTable';
import './styles/export-table.scss';

let first = true;

const PdfExport = () => {
  const [dataForPdf, setDataForPdf] = useState(null);

  useEffect(() => {
    ipcRenderer.send('PDF_READY');
  }, []);

  useEffect(() => {
    ipcRenderer.on('PDF_DATA', (_, sessionData) => {
      console.log('got sent PDF_DATA:', sessionData); // eslint-disable-line no-console
      setDataForPdf(sessionData);
    });

    return () => {
      console.log('PdfExport unmounting'); // eslint-disable-line no-console
      ipcRenderer.removeAllListeners('PDF_DATA');
    };
  }, []);

  useEffect(() => {
    let timeout;

    if (!dataForPdf) { return () => { }; }

    // For some reason, the first render is suuuuper slow. This is a total hack,
    // but will work for this use-case.
    if (first) {
      first = false;

      timeout = setTimeout(() => {
        ipcRenderer.send('PDF_HAS_DATA');
      }, 1500);
    } else {
      ipcRenderer.send('PDF_HAS_DATA');
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [dataForPdf]);

  if (!dataForPdf) {
    return null;
  }

  return (
    <div>
      <h1 style={{ color: 'rgb(109, 111, 118)' }}>
        Case ID:
        {' '}
        {Object.keys(dataForPdf)[0]}
      </h1>
      <h3 style={{ color: 'rgb(109, 111, 118)' }}>
        Partner Notification
      </h3>
      <div>
        <ExportTable data={Object.values(dataForPdf)[0]} />
      </div>
    </div>
  );
};

export default PdfExport;
