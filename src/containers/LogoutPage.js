import { Component } from 'react';
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

export default connect()(LogoutPage);
