import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { actionCreators as stageActions } from '../ducks/modules/stage';
import { getStages } from '../selectors/session';
import { Menu } from '../components';

/**
  * Renders a Menu using stages to construct items in the menu
  */
class StageMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchTerm: '',
      matchingStages: this.props.stages,
    };

    this.onInputChange = this.onInputChange.bind(this);
  }

  onInputChange(event) {
    this.setState({
      searchTerm: event.target.value,
      matchingStages: this.props.stages.filter(
        stage => stage.title.toLowerCase().includes(event.target.value.toLowerCase())),
    });
  }

  render() {
    let stages = this.props.stages;
    if (this.state.searchTerm) {
      stages = this.state.matchingStages;
    }

    const items = stages.map(stage =>
      ({
        to: `/protocol/${stage.id}`,
        id: stage.id,
        title: stage.title,
        imageType: stage.type,
        onClick: () => this.props.onStageClick(this.props.stages, stage.id),
      }));

    const search = (
      <div className="bm-search">
        <input type="search" placeholder="Filter" onKeyUp={this.onInputChange} />
      </div>
    );

    return (
      <Menu items={items} searchField={search} />
    );
  }
}

StageMenu.propTypes = {
  stages: PropTypes.array.isRequired,
  onStageClick: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  const stages = getStages(state);

  return {
    stages,
  };
}

const mapDispatchToProps = dispatch => ({
  onStageClick: bindActionCreators(stageActions.setStage, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(StageMenu);
