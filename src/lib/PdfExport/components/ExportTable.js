import React from 'react';

const ExportTable = ({ data }) => (
  <table className="export-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Phone/Contact</th>
        <th>First</th>
        <th>Last</th>
        <th>Freq</th>
        <th>Age</th>
        <th>Height</th>
        <th>Weight</th>
        <th>Role/Protect</th>
        <th>Met?</th>
      </tr>
    </thead>
    <tbody>
      {Object.keys(data).map(((node) => {
        const row = data[node];
        return (
          <tr key={node}>
            <td>{row.name}</td>
            <td>{row.phone}</td>
            <td>{row.first}</td>
            <td>{row.last}</td>
            <td>{row.freq}</td>
            <td>{row.age}</td>
            <td>{row.height}</td>
            <td>{row.weight}</td>
            <td>
              {row.role}
              /
              {row.protection}
            </td>
            <td>{row.met}</td>
          </tr>
        );
      }))}
    </tbody>
  </table>
);

export default ExportTable;
