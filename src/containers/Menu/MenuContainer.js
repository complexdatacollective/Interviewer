import React, { Component } from 'react';
import cx from 'classnames';
import { Button, Icon } from '../../ui/components';
import { StagesMenu, SettingsMenu } from '.';


class MenuContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activePanel: 'stages',
    };

    this.toggleActivePanel = this.toggleActivePanel.bind(this);
  }

  toggleActivePanel() {
    const activePanel = this.state.activePanel === 'settings' ? 'stages' : 'settings';
    this.setState({ activePanel });
  }

  render() {
    return (
      <div className="menu-container">
        <div className="menu-container__content">
          <div className="menu-container__header">
            <Icon name="close" />
          </div>
          <div className="menu-container__panels">
            <div className="menu-panels">
              <div
                className={cx({
                  'menu-panel': true,
                  'menu-panel__settings': true,
                  active: this.state.activePanel === 'settings',
                })}
                onClick={this.toggleActivePanel}
              >
                <SettingsMenu />
              </div>
              <div
                className={cx({
                  'menu-panel': true,
                  'menu-panel__stages': true,
                  active: this.state.activePanel === 'stages',
                })}
                onClick={this.toggleActivePanel}
              >
                <StagesMenu />
              </div>
            </div>
          </div>
          <div className="menu-container__footer">
            <Button color="neon-coral">Return to start screen</Button>
          </div>
        </div>
      </div>
    );
  }
}

export default MenuContainer;
