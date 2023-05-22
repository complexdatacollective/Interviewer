import React, { useState } from 'react';
import './styles/export-table.scss';
import { remote } from 'electron';
import { Button } from '@codaco/ui';
import ExportTable from './components/ExportTable';

const { ipcRenderer } = require('electron');
const fs = require('fs');

const PdfExport = () => {
  const [dataForPdf, setDataForPdf] = useState({
    0: {
      name: 'A',
      weight: '134',
      age: 34,
      last: '5/1/23',
      injectionDrugPartner: null,
      height: "5'8''",
      met: 'steamworks',
      freq: 3,
      role: ['top'],
      injectionDrugUse: null,
      first: '5/1/22',
      protection: ['yes'],
      egoInjectionDrugUse: null,
      hair: 'brown',
      phone: '123-456-7890',
    },
    1: {
      name: 'B',
      weight: '153',
      age: 44,
      last: '5/1/23',
      injectionDrugPartner: null,
      height: "5'11''",
      met: 'tinder',
      freq: 4,
      role: ['bottom'],
      injectionDrugUse: null,
      first: '5/1/22',
      protection: ['sometimes'],
      egoInjectionDrugUse: null,
      hair: 'blonde',
      phone: '459-399-1234',
    },
    2: {
      name: 'C',
      weight: '187',
      age: 21,
      last: '3/15/23',
      injectionDrugPartner: null,
      height: "6'1''''",
      met: 'grindr',
      freq: 10,
      role: ['top'],
      injectionDrugUse: null,
      first: '5/1/22',
      protection: ['sometimes'],
      egoInjectionDrugUse: null,
      hair: 'brown',
      phone: '123-566-2131',
    },
  });
  const [filepathForDownload, setFilepathForDownload] = useState('networkCanvasExport.pdf');

  // will be passed via setInterviewInfo(sessionData[0].caseId)
  const [interviewInfo, setInterviewInfo] = useState({ caseID: '123456' });

  // receive sessionData via ipc
  ipcRenderer.on('PDF_DATA', (event, sessionData, filepath, protocol) => {
    console.log('PDF_DATA', sessionData, filepath);
    // setDataForPdf(sessionData);
    // setFilepathForDownload(filepath);
  });

  console.log('ipcRenderer', ipcRenderer);
  console.log('dataForPdf', dataForPdf);
  console.log('filepathForDownload', filepathForDownload);

  const printToPDF = async () => {
    const options = {
      printBackground: true,
      landscape: true,
      marginsType: 1,
    };
    // get webContents, wait for load, then printToPDF
    const wc = remote.getCurrentWebContents();
    await wc.printToPDF(options).then((pdf) => {
      // write PDF to file
      fs.writeFile(filepathForDownload, pdf, (error) => {
        if (error) {
          console.log('error', error);
        } else {
          console.log('PDF saved');
        }
      });
    });
  };

  return (
    <div style={{ margin: '2rem' }}>
      <h1>
        Case ID:
        {' '}
        {interviewInfo.caseID}
      </h1>
      <h3>
        Partner Notification
      </h3>
      <div>
        <ExportTable data={dataForPdf} />
      </div>
      <Button onClick={printToPDF}>Save as PDF</Button>
    </div>
  );
};

export default PdfExport;
