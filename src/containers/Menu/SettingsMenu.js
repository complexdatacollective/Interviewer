import React, { Component } from 'react';
import { Icon } from '../../ui/components';

// eslint-disable-next-line
class SettingsMenu extends Component {

  render() {
    return (
      <React.Fragment>
        <Icon name="settings" />
        <div className="settings-menu">
          <div className="settings-menu__header">
            <h1>Settings</h1>
          </div>
          <div className="settings-menu__form">
            <p>Some settings and things will go here.</p>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default SettingsMenu;
