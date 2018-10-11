import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Button } from '../../ui/components';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { actionCreators as sessionActions } from '../../ducks/modules/session';

class StatsPanel extends Component {
  handleFinishInterview = () => {
    this.props.endSession();
    this.props.closeMenu();
  }

  render() {
    return (
      <div className="stages-menu__stats">
        <h4>Session Information</h4>
        <Button onClick={this.handleFinishInterview}>Finish Interview</Button>
      </div>
    );
  }
};

const mapDispatchToProps = dispatch => ({
  closeMenu: () => dispatch(uiActions.update({ isMenuOpen: false })),
  endSession: () => {
    dispatch(sessionActions.endSession());
    dispatch(push('/'));
  },
});

export { StatsPanel };

export default connect(null, mapDispatchToProps)(StatsPanel);
