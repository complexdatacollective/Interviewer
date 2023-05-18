import React from 'react';
import './styles/export-table.scss';

const { ipcRenderer } = require('electron');

const PdfExport = () => {
  // receive sessionData via ipc
  ipcRenderer.on('SESSION_DATA', (event, sessionData) => {
    console.log('sessiondata from ipc method', sessionData);
  });

  return (
    <div>
      <h2>PDF Export</h2>
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
