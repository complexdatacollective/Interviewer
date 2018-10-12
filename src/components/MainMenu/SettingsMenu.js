import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Button } from '../../ui/components';
import MenuPanel from './MenuPanel';

const SettingsMenu = ({
  active,
  onClickInactive,
  handleAddMockData,
  handleResetAppData,
}) => (
  <MenuPanel
    active={active}
    panel="settings"
    onClickInactive={onClickInactive}
  >
    <Icon name="settings" />
    <div className="settings-menu">
      <div className="settings-menu__header">
        <h1>Settings</h1>
      </div>
      <div className="settings-menu__form">
        <Button
          onClick={handleAddMockData}
        >
          Add mock nodes
        </Button>

        <Button
          onClick={handleResetAppData}
        >
          Reset Network Canvas data
        </Button>
      </div>
    </div>
  </MenuPanel>
);

SettingsMenu.propTypes = {
  active: PropTypes.bool,
  onClickInactive: PropTypes.func,
  handleResetAppData: PropTypes.func.isRequired,
  handleAddMockData: PropTypes.func.isRequired,
};

SettingsMenu.defaultProps = {
  active: false,
  onClickInactive: () => {},
};

export default SettingsMenu;
