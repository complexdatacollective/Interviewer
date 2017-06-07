import React from 'react';

/**
  * Alphanumeric field type
  */
const Alphanumeric = field => (
  <div>
    <input type="text" placeholder={field.label} {...field.input} />
    {field.meta.invalid &&
      <div>{field.meta.error}</div>}
  </div>
);

export default Alphanumeric;
