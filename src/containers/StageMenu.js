import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'react-router-redux';

import { actionCreators as menuActions } from '../ducks/modules/menu';
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

  componentDidUpdate = () => {
    if (!this.props.isOpen) {
      this.search.blur();
    }
  }

  onInputChange = (event) => {
    this.props.updateSearch(event.target.value);
  }

  render() {
    const {
      currentStages,
      currentStage,
      filteredList,
      hideButton,
      isOpen,
      onStageClick,
      protocolPath,
      searchValue,
      toggleMenu,
    } = this.props;

    const items = filteredList.map(filteredStage =>
      ({
        id: filteredStage.id,
        icon: filteredStage.icon,
        label: filteredStage.label,
        interfaceType: filteredStage.type,
        isActive: currentStage === filteredStage,
        onClick: () => onStageClick(`/protocol/${protocolPath}/${currentStages.indexOf(filteredStage)}`),
      }));

    const search = (
      <div className={`menu__search ${isOpen ? '' : 'menu__search--closed'}`}>
        <input ref={(input) => { this.search = input; }} type="search" placeholder="Filter" onChange={this.onInputChange} value={searchValue} />
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
  protocolPath: PropTypes.string,
  searchValue: PropTypes.string,
  toggleMenu: PropTypes.func.isRequired,
  updateSearch: PropTypes.func,
};

StageMenu.defaultProps = {
  currentStage: null,
  hideButton: false,
  isOpen: false,
  protocolPath: '',
  searchValue: '',
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
    protocolPath: state.protocol.path,
    searchValue: stageSearchTerm(state),
  };
}

const mapDispatchToProps = dispatch => ({
  onStageClick: path => dispatch(push(path)),
  toggleMenu: bindActionCreators(menuActions.toggleStageMenu, dispatch),
  updateSearch: bindActionCreators(menuActions.updateStageSearch, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(StageMenu);
