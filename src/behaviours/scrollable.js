import React from 'react';

const scrollable = (WrappedComponent) => {
  const Scrollable = props => (
    <div className="scrollable">
      <WrappedComponent {...props} />
    </div>
  );
  return Scrollable;
};

export default scrollable;
