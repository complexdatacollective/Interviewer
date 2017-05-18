import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { actionCreators as stageActions } from '../ducks/modules/stage';
import { stages, stage } from '../selectors/session';
import { Menu } from '../components';

/**
  * Renders a Menu using stages to construct items in the menu
  */
class StageMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchTerm: '',
      matchingStages: this.props.currentStages,
    };

    this.onInputChange = this.onInputChange.bind(this);
  }

  onInputChange(event) {
    this.setState({
      searchTerm: event.target.value,
      matchingStages: this.props.currentStages.filter(
        currentStage =>
          currentStage.title.toLowerCase().includes(event.target.value.toLowerCase())),
    });
  }

  render() {
    let filteredStages = this.props.currentStages;
    if (this.state.searchTerm) {
      filteredStages = this.state.matchingStages;
    }

    const items = filteredStages.map(filteredStage =>
      ({
        id: filteredStage.id,
        title: filteredStage.title,
        imageType: filteredStage.type,
        isActive: this.props.currentStage === filteredStage,
        onClick: () => this.props.onStageClick(this.props.currentStages, filteredStage.id),
      }));

    const search = (
      <div className="menu__search">
        <input type="search" placeholder="Filter" onKeyUp={this.onInputChange} />
      </div>
    );

    return (
      <Menu items={items} searchField={search} />
    );
  }
}

StageMenu.propTypes = {
  currentStages: PropTypes.array.isRequired,
  currentStage: PropTypes.string.isRequired,
  onStageClick: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  const currentStages = stages(state);
  const currentStage = stage(state);

  return {
    currentStages,
    currentStage,
  };
}

const mapDispatchToProps = dispatch => ({
  onStageClick: bindActionCreators(stageActions.setStage, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(StageMenu);
