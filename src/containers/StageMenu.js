import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router';

import { actionCreators as stageActions } from '../ducks/modules/stage';
import { Menu } from '../components';



class StageMenu extends Component {
  render() {
    const {
      stages
    } = this.props;
    const links = stages.map((stage, index) =>
      <Link to='protocol' key={stage.id} onClick={() => this.props.onStageClick(index)} activeClassName='bm-item-active'>{stage.title}</Link>);

    return (
      <Menu>
        {links}
      </Menu>
    );
  }
}

function mapStateToProps(state) {
  const stages = state.protocol.protocolConfig.stages;

  return {
    stages
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onStageClick: bindActionCreators(stageActions.setStage, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StageMenu);
