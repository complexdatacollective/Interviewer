import React from 'react';

// TODO: use components provided by network-canvas-ui
export default {
  text: field => (
    <div>
      <input type="text" placeholder={field.label} {...field.input} />
      {field.meta.invalid &&
        <div>{field.meta.error}</div>}
    </div>
  ),
  number: field => (
    <div>
      <input type="number" placeholder={field.label} {...field.input} />
      {field.meta.invalid &&
        <div>{field.meta.error}</div>}
    </div>
  ),
};
