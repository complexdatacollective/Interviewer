import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Button } from '../../ui/components';
import MenuPanel from './MenuPanel';

const SettingsMenu = ({
  active,
  onClickInactive,
  handleAddMockNodes,
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
        <p>
          <Button
            onClick={handleAddMockNodes}
          >
            Add mock nodes
          </Button>
        </p>
        <p>
          <Button
            onClick={handleResetAppData}
          >
            Reset Network Canvas data
          </Button>
        </p>
      </div>
    </div>
  </MenuPanel>
);

SettingsMenu.propTypes = {
  active: PropTypes.bool,
  onClickInactive: PropTypes.func,
  handleResetAppData: PropTypes.func.isRequired,
  handleAddMockNodes: PropTypes.func.isRequired,
};

SettingsMenu.defaultProps = {
  active: false,
  onClickInactive: () => {},
};

export default SettingsMenu;
