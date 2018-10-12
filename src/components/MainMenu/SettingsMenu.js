import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '../../ui/components';
import MenuPanel from './MenuPanel';

const SettingsMenu = ({ active, onClickInactive }) => (
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
        <p>Some settings and things will go here.</p>
      </div>
    </div>
  </MenuPanel>
);

SettingsMenu.propTypes = {
  active: PropTypes.bool,
  onClickInactive: PropTypes.func,
};

SettingsMenu.defaultProps = {
  active: false,
  onClickInactive: () => {},
};

export default SettingsMenu;
