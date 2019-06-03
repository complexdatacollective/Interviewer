import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

export const scrollable = (WrappedComponent) => {
  const Scrollable = props => (
    <div className={`scrollable ${(props.showScollbars && 'scrollable--show-scrollbars')}`} onScroll={props.onScroll}>
      <WrappedComponent {...props} />
    </div>
  );
  return Scrollable;
};

const mapStateToProps = state => ({
  showScollbars: state.deviceSettings.showScrollbars,
});

const composedScrollable = compose(
  connect(mapStateToProps, null),
  scrollable,
);

export default composedScrollable;
