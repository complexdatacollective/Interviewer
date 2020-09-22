/* eslint-disable react/no-find-dom-node */

import React, { useState } from 'react';
import PropTypes from 'prop-types';

export const selectable = WrappedComponent => ({
  onSelected,
  allowSelect = true,
  ...rest
}) => {
  const [selected, setSelected] = useState(false);

  const handleSelect = () => {
    if (!allowSelect) { return; }

    if (!selected) {
      setSelected(true);
      onSelected();
      return;
    }

    setSelected(false);
  };

  return (
    <div onClick={handleSelect} >
      <WrappedComponent {...rest} selected={selected} onClick={handleSelect} />
    </div>
  );
};

selectable.propTypes = {
  onSelected: PropTypes.func,
  allowSelect: PropTypes.bool,
};

selectable.defaultProps = {
  onSelected: null,
  allowSelect: true,
};

export default selectable;
