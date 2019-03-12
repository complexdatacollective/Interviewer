import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { compose } from 'redux';

import { Icon, Spinner } from '../ui/components';
import Fade from '../ui/components/Transitions/Fade';
import { actionCreators as sessionActions } from '../ducks/modules/session';

const minimumTimeToDisplaySpinner = 1000;

class LoadScreen extends Component {
  static getDerivedStateFromProps(props) {
    if (props.isWorking) {
      return { minimumTimeMet: false };
    }

    return null;
  }

  constructor(props) {
    super(props);
    this.timer = () => this.setState({ minimumTimeMet: true });
    this.state = {
      minimumTimeMet: true,
    };
  }

  componentDidMount() {
    this.scheduleSpinnerExpiration();
  }

  componentDidUpdate() {
    this.scheduleSpinnerExpiration();
  }

  scheduleSpinnerExpiration() {
    if (this.props.isWorking) {
      setTimeout(this.timer, minimumTimeToDisplaySpinner);
    }
  }

  handleClose = () => {
    this.state = {
      minimumTimeMet: true,
    };
    this.props.endSession();
    clearTimeout(this.timer);
    this.timer();
  }

  render() {
    return (
      <Fade in={this.props.isWorking || !this.state.minimumTimeMet}>
        <div className="load-screen">
          <Icon className="load-screen__close" name="close" onClick={this.handleClose} />
          <Spinner large />
        </div>
      </Fade>
    );
  }
}

LoadScreen.propTypes = {
  isWorking: PropTypes.bool,
  endSession: PropTypes.func.isRequired,
};

LoadScreen.defaultProps = {
  isWorking: false,
};

const mapStateToProps = state => ({
  isWorking: state.protocol.isLoading,
});

const mapDispatchToProps = dispatch => ({
  endSession: () => {
    dispatch(sessionActions.endSession());
    dispatch(push('/'));
  },
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(LoadScreen);
