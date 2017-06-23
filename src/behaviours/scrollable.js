import React from 'react';

export default function scrollable(WrappedComponent) {
  function Scrollable(props) {
    return (
      <div className="scrollable">
        <WrappedComponent {...props} />
      </div>
    );
  }

  return Scrollable;
}
