import React from 'react';

const ExportTable = ({ data }) => (
  <table className="export-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>
          Phone
          {' '}
          /
          <br />
          Contact

        </th>
        <th>First</th>
        <th>Last</th>
        <th>Freq</th>
        <th>Age</th>
        <th>Height</th>
        <th>Weight</th>
        <th>
          Role
          {' '}
          /
          <br />
          Protect

        </th>
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
            <td>{row.first_sex}</td>
            <td>{row.last_sex}</td>
            <td>{row.num_times}</td>
            <td>{row.age}</td>
            <td>{row.height}</td>
            <td>{row.weight}</td>
            <td>
              {row.partner_sex_role}
              {' '}
              /
              {' '}
              {row.condoms}
            </td>
            <td>{row.venue_met_text}</td>
          </tr>
        );
      }))}
    </tbody>
  </table>
);

export default ExportTable;
