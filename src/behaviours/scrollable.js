import React from 'react';

export default function scrollable(WrappedComponent) {
  function Scrollable(props) {
    return (
      <div className="scrollable">
        <div className="scrollable__window">
          <WrappedComponent {...props} />
        </div>
      </div>
    );
  }

  return Scrollable;
}
