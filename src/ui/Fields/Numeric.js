import React from 'react';

/**
  * Numeric field type
  */
const Numeric = field => (
  <div>
    <input type="number" placeholder={field.label} {...field.input} />
    {field.meta.invalid &&
      <div>{field.meta.error}</div>}
  </div>
);

export default Numeric;
