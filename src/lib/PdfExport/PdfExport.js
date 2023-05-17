import React from 'react';

const PdfExport = ({ data }) => {
  if (!data) { return null; }

  const { sessionData, filePath } = data;

  return (
    <div>
      <h1>PDF Export</h1>

    </div>
  );
};

export default PdfExport;
