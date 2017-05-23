import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { actionCreators as menuActions } from '../ducks/modules/menu';
import { actionCreators as stageActions } from '../ducks/modules/stage';
import { stages, stage } from '../selectors/session';
import { Menu } from '../components';

const menuIsOpen = state => state.menu.menuIsOpen;

/**
  * Renders a Menu using stages to construct items in the menu
  * @extends Component
  */
class StageMenu extends Component {
  /**
    * adds search term and list of matching stages to local state
    */
  constructor(props) {
    super(props);

    this.state = {
      searchTerm: '',
      matchingStages: this.props.currentStages,
    };

    this.onInputChange = this.onInputChange.bind(this);
  }

  /**
    * updates search term and matching stages when input changes
    * @param event {event}
    */
  onInputChange(event) {
    this.setState({
      searchTerm: event.target.value,
      matchingStages: this.props.currentStages.filter(
        currentStage =>
          currentStage.title.toLowerCase().includes(event.target.value.toLowerCase())),
    });
  }

  render() {
    const { currentStages, currentStage, isOpen, onStageClick, toggleMenu } = this.props;

    let filteredStages = currentStages;
    if (this.state.searchTerm) {
      filteredStages = this.state.matchingStages;
    }

    const items = filteredStages.map(filteredStage =>
      ({
        id: filteredStage.id,
        title: filteredStage.title,
        imageType: filteredStage.type,
        isActive: currentStage === filteredStage,
        onClick: () => onStageClick(currentStages, filteredStage.id),
      }));

    const search = (
      <div className="menu__search">
        <input type="search" placeholder="Filter" onKeyUp={this.onInputChange} />
      </div>
    );

    return (
      <Menu
        isOpen={isOpen}
        items={items}
        searchField={search}
        toggleMenu={toggleMenu}
      />
    );
  }
}

StageMenu.propTypes = {
  currentStages: PropTypes.array.isRequired,
  currentStage: PropTypes.object,
  isOpen: PropTypes.bool,
  onStageClick: PropTypes.func.isRequired,
  toggleMenu: PropTypes.func.isRequired,
};

StageMenu.defaultProps = {
  currentStage: null,
  isOpen: false,
};

function mapStateToProps(state) {
  const currentStages = stages(state);
  const currentStage = stage(state);

  return {
    isOpen: menuIsOpen(state),
    currentStages,
    currentStage,
  };
}

const mapDispatchToProps = dispatch => ({
  onStageClick: bindActionCreators(stageActions.setStage, dispatch),
  toggleMenu: bindActionCreators(menuActions.toggleMenu, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(StageMenu);
