import React, { useState } from 'react';
import './styles/export-table.scss';
import { remote } from 'electron';
import { Button } from '@codaco/ui';

const { ipcRenderer } = require('electron');

const PdfExport = () => {
  const [dataForPdf, setDataForPdf] = useState();
  const [filepathForDownload, setFilepathForDownload] = useState('networkCanvasExport.pdf');
  // receive sessionData via ipc
  ipcRenderer.on('PDF_DATA', (event, sessionData, filepath) => {
    setDataForPdf(sessionData);
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
      const fs = require('fs');
      fs.writeFile(filepathForDownload, pdf, (error) => {
        if (error) {
          console.log('error', error);
        } else {
          console.log('PDF saved');
        }
      });
    });
  };
  // format dataForPdf for table
  return (
    <div>
      <h2>PDF Export</h2>
      <Button onClick={printToPDF}>Print to PDF</Button>
      <div>
        <table className="export-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone Contact</th>
              <th>First</th>
              <th>Last</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>FirstName LastName</td>
              <td>123-456-789</td>
              <td>3/18/21</td>
              <td>4/19/23</td>
            </tr>
            <tr>
              <td>FirstName LastName</td>
              <td>123-456-789</td>
              <td>3/18/21</td>
              <td>4/19/23</td>
            </tr>
            <tr>
              <td>FirstName LastName</td>
              <td>123-456-789</td>
              <td>3/18/21</td>
              <td>4/19/23</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PdfExport;
