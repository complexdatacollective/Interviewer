import React from 'react';
import PropTypes from 'prop-types';
import Touch from 'react-hammerjs';

export default function selectable(WrappedComponent) {
  const Selectable = (props) => {
    console.log(props.canSelect);
    if (!props.canSelect) { return <WrappedComponent {...props} />; }
    return (
      <Touch onTap={props.onSelected}>
        <WrappedComponent {...props} />
      </Touch>
    );
  };

  Selectable.propTypes = {
    onSelected: PropTypes.func,
    canSelect: PropTypes.bool,
  };

  Selectable.defaultProps = {
    onSelected: () => {},
    canSelect: true,
  };

  return Selectable;
}
