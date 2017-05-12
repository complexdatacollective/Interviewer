import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';

const HomePage = (props) => {
  const {
    participant,
  } = props;

  return (
    <div className="container">
      <h1 >
        Welcome {participant.userProfile && participant.userProfile.name}
      </h1>
      <h3 >
        <Link to="protocol">Access sample protocol</Link>
      </h3>
    </div>
  );
};

HomePage.propTypes = {
  participant: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    auth: state.auth,
    network: state.network,
    participant: state.participant,
  };
}

export default connect(mapStateToProps)(HomePage);
