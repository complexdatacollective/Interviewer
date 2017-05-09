import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { actionCreators as stageActions } from '../ducks/modules/stage';
import { Menu } from '../components';
import { MenuItem } from '../components/Elements';

class StageMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchTerm: '',
      matchingStages: this.props.stages
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.menuItemClick = this.menuItemClick.bind(this);
  }

  onInputChange(event) {
    this.setState({
      searchTerm: event.target.value,
      matchingStages: this.props.stages.filter((stage) => stage.title.toLowerCase().includes(event.target.value.toLowerCase()))
    });
  }

  menuItemClick(index) {
    this.props.onStageClick(index);
    console.log("toggle menu");
  }

  render() {
    let stages = this.props.stages;
    if (this.state.searchTerm) {
      stages = this.state.matchingStages;
    }

    const links = stages.map((stage, index) =>
      <MenuItem to={'/protocol/'+stage.id} key={stage.id} onClick={() => this.menuItemClick(index)} title={stage.title} />);

    return (
      <Menu>
        <div className='bm-search'>
          <input type='search' placeholder='Filter' onKeyUp={this.onInputChange}/>
        </div>
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
