import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { actionCreators as participantActions } from '../ducks/modules/participant';

class LogoutPage extends Component {
  componentWillMount() {
    this.props.dispatch(participantActions.destroyParticipant());
  }
  // logout link serves as just a dispatcher
  render() {
    return null;
  }
}

LogoutPage.propTypes = {
  dispatch: PropTypes.any.isRequired,
};

export default connect()(LogoutPage);
