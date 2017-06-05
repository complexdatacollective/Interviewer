/* eslint-disable */

import React from 'react';
import { prepopulatedField } from '../../behaviors';

/**
  * Alphanumeric field type
  */
const Alphanumeric = (field) => {
  return (
    <div>
      <input type="text" placeholder={field.label} {...field.input}/>
      {field.meta.invalid &&
        <div>{field.meta.error}</div>}
    </div>
  );
};

export default Alphanumeric;
// export default prepopulatedField(Alphanumeric);
