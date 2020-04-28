import React from 'react';
import { connect } from 'react-redux';
import { actionCreators as uiActions } from '../../ducks/modules/ui';

const Export = (props) => {
  // const {
  // } = props;

  return (
    <h1>ExportOverlay</h1>
  );
};

Export.propTypes = {
};

Export.defaultProps = {
};

function mapStateToProps(state) {
  return {
    sessions: state.sessions,
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Export);

export { Export as UnconnectedExport };
