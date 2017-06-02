import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { actionCreators as menuActions } from '../ducks/modules/menu';
import { actionCreators as stageActions } from '../ducks/modules/stage';
import { stages, stage, filteredStages, stageMenuIsOpen, stageSearchTerm } from '../selectors/session';
import { Menu } from '../components';

/**
  * Renders a Menu using stages to construct items in the menu
  * @extends Component
  */
class StageMenu extends Component {
  /**
    * updates search term and matching stages when input changes
    * @param event {event}
    */
  onInputChange = (event) => {
    this.props.updateSearch(event.target.value);
  }

  render() {
    const {
      currentStages, currentStage, filteredList, hideButton, isOpen, onStageClick, toggleMenu,
    } = this.props;

    const items = filteredList.map(filteredStage =>
      ({
        id: filteredStage.id,
        title: filteredStage.title,
        interfaceType: (typeof filteredStage.type === 'string' && filteredStage.type) || 'custom',
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
        hideButton={hideButton}
        isOpen={isOpen}
        items={items}
        searchField={search}
        title="Stages"
        toggleMenu={toggleMenu}
      />
    );
  }
}

StageMenu.propTypes = {
  currentStages: PropTypes.array.isRequired,
  currentStage: PropTypes.object,
  filteredList: PropTypes.array.isRequired,
  hideButton: PropTypes.bool,
  isOpen: PropTypes.bool,
  onStageClick: PropTypes.func.isRequired,
  toggleMenu: PropTypes.func.isRequired,
  updateSearch: PropTypes.func,
};

StageMenu.defaultProps = {
  currentStage: null,
  hideButton: false,
  isOpen: false,
  searchTerm: '',
  updateSearch: () => {},
};

function mapStateToProps(state) {
  const currentStages = stages(state);
  const currentStage = stage(state);
  const filteredList = filteredStages(state);

  return {
    isOpen: stageMenuIsOpen(state),
    currentStages,
    currentStage,
    filteredList,
    searchTerm: stageSearchTerm(state),
  };
}

const mapDispatchToProps = dispatch => ({
  onStageClick: bindActionCreators(stageActions.setStage, dispatch),
  toggleMenu: bindActionCreators(menuActions.toggleStageMenu, dispatch),
  updateSearch: bindActionCreators(menuActions.updateStageSearch, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(StageMenu);
