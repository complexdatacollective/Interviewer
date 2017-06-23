import React from 'react';
import PropTypes from 'prop-types';
import Touch from 'react-hammerjs';

export default function selectable(WrappedComponent) {
  const Selectable = props => (
    <Touch onTap={props.onSelected}>
      <WrappedComponent {...props} />
    </Touch>
  );

  Selectable.propTypes = {
    onSelected: PropTypes.func,
  };

  Selectable.defaultProps = {
    onSelected: () => {},
  };

  return Selectable;
}
