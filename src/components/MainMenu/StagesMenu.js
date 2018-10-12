import React from 'react';
import PropTypes from 'prop-types';
import Timeline from '../../components/MainMenu/Timeline';
import StatsPanel from './StatsPanel';
import { Icon } from '../../ui/components';
import MenuPanel from './MenuPanel';

const StagesMenu = ({ active, onClickInactive, currentStages }) => (
  <MenuPanel
    active={active}
    panel="stages"
    onClickInactive={onClickInactive}
  >
    <Icon name="menu-default-interface" />
    <div className="stages-menu" >
      <div className="stages-menu__timeline">
        <div className="stages-timeline__header">
          <h1>Interview Stages</h1>
          <input className="stages-input" type="text" placeholder="Filter stages..." />
        </div>
        <Timeline items={currentStages} />
      </div>
      <StatsPanel />
    </div>
  </MenuPanel>
);

StagesMenu.propTypes = {
  currentStages: PropTypes.array.isRequired,
  active: PropTypes.bool,
  onClickInactive: PropTypes.func,
};

StagesMenu.defaultProps = {
  active: false,
  onClickInactive: () => {},
};

export default StagesMenu;

