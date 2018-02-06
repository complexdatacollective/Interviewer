import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Spinner } from 'network-canvas-ui';
import Fade from '../components/Transition/Fade';

const LoadScreen = ({ isWorking }) => (
  <Fade in={isWorking}>
    <div className="load-screen">
      <Spinner large />
    </div>
  </Fade>
);

LoadScreen.propTypes = {
  isWorking: PropTypes.bool,
};

LoadScreen.defaultProps = {
  isWorking: false,
};

const mapStateToProps = state => ({
  isWorking: state.protocol.isLoading,
});

export default compose(
  connect(mapStateToProps),
)(LoadScreen);
