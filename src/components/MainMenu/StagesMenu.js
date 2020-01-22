import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@codaco/ui';
import { Text } from '@codaco/ui/lib/components/Fields';
import Timeline from './Timeline';
import MenuPanel from './MenuPanel';


class StagesMenu extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      stages: this.props.currentStages,
    };
  }

  onInputChange = (event) => {
    this.setState({ stages: this.filterStageList(event.target.value) });
  };

  filterStageList = stageFilterTerm => this.props.currentStages.filter(
    stage => stage.label.toLowerCase().includes(stageFilterTerm.toLowerCase()));

  render() {
    const {
      active,
      onClickInactive,
      onCloseMenu,
    } = this.props;
    return (
      <MenuPanel
        active={active}
        panel="stages"
        onClickInactive={onClickInactive}
        onCloseMenu={onCloseMenu}
      >
        <Icon name="menu-default-interface" />
        <div className="main-menu-stages-menu" >
          <div className="main-menu-stages-menu__timeline">
            <div className="main-menu-stages-menu__timeline-header">
              <h1>Interview Stages</h1>
              <div className="main-menu-stages-menu__timeline-header--filter">
                <h4>Filter: </h4>
                <Text
                  type="search"
                  placeholder="Filter Stages..."
                  input={{
                    onChange: this.onInputChange,
                  }}
                />
              </div>
            </div>
            <Timeline items={this.state.stages} />
          </div>
        </div>
      </MenuPanel>
    );
  }
}

StagesMenu.propTypes = {
  currentStages: PropTypes.array.isRequired,
  active: PropTypes.bool,
  onClickInactive: PropTypes.func,
  onCloseMenu: PropTypes.func.isRequired,
};

StagesMenu.defaultProps = {
  active: false,
  onClickInactive: () => {},
};

export default StagesMenu;

