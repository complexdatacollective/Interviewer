import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

class HomePage extends Component {

  render() {
    const {
      participant
    } = this.props;

    return (
        <div className="container">
          <h1 >
            Welcome {participant.userProfile && participant.userProfile.name}
          </h1>
          <h3 >
            <Link to='protocol'>Access sample protocol</Link>
          </h3>
        </div>

    );
  }
}

HomePage.propTypes = {
  auth: React.PropTypes.object,
  network: React.PropTypes.object,
  participant: React.PropTypes.object
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    network: state.network,
    participant: state.participant
  }
}

export default connect(mapStateToProps)(HomePage);
