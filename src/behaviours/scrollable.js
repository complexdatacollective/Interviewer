import { Scroller } from '@codaco/ui';
import React from 'react';
import { compose } from 'redux';

export const scrollable = (WrappedComponent) => {
  const Scrollable = (props) => (
    <Scroller onScroll={props.onScroll}>
      <WrappedComponent {...props} />
    </Scroller>
  );
  return Scrollable;
};

const composedScrollable = compose(
  scrollable,
);

export default composedScrollable;
