import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Spinner } from '../ui/components';
import Fade from '../components/Transition/Fade';

class LoadScreen extends Component {
  static getDerivedStateFromProps(props) {
    if (props.isWorking) {
      return { minimumTimeMet: false };
    }

    return null;
  }

  constructor(props) {
    super(props);
    this.state = {
      minimumTimeMet: true,
    };
  }

  componentDidMount() {
    if (this.props.isWorking) {
      setTimeout(() => this.setState({ minimumTimeMet: true }), 1000);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isWorking !== this.props.isWorking && this.props.isWorking) {
      setTimeout(() => this.setState({ minimumTimeMet: true }), 1000);
    }
  }

  render() {
    return (
      <Fade in={this.props.isWorking || !this.state.minimumTimeMet}>
        <div className="load-screen">
          <Spinner large />
        </div>
      </Fade>
    );
  }
}

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
