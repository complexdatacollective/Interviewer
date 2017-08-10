import React from 'react';
import { TextInput } from 'network-canvas-ui';

/**
  * Alphanumeric field type
  */
const Alphanumeric = field => (
  <div>
    <TextInput
      label={field.label}
      placeholder={field.label}
      name={field.input.name}
      errorText={
        field.meta.invalid &&
        <div>{field.meta.error}</div>
      }
      {...field.input}
    />
  </div>
);

export default Alphanumeric;
