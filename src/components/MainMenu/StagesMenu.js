import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Timeline from '../../components/MainMenu/Timeline';
import StatsPanel from './StatsPanel';
import { Icon } from '../../ui/components';

const StagesMenu = ({ active, onClickInactive, currentStages }) => {
  const handleClickInactive = !active ? onClickInactive : null;

  return (
    <div
      className={cx(
        'menu-panel',
        'menu-panel__stages',
        { 'menu-panel--active': active },
      )}
      onClick={handleClickInactive}
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
    </div>
  );
};

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

