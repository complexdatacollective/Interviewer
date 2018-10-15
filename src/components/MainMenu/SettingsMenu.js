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
        <fieldset>
          <legend>Developer Options</legend>
          <p>During an active interview session, clicking this button will create mock nodes for
           testing purposes.</p>
          <Button
            color="mustard"
            onClick={handleAddMockNodes}
          >
            Add mock nodes
          </Button>
        </fieldset>
        <fieldset>
          <legend>Global App Settings</legend>
          <p>Click the button below to reset all app data.</p>
          <Button
            color="mustard"
            onClick={handleResetAppData}
          >
            Reset Network Canvas data
          </Button>
        </fieldset>
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
