import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Button, Icon } from '../../ui/components';
import StagesMenu from '../../containers/MainMenu/StagesMenu';
import SettingsMenu from './SettingsMenu';

class MainMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activePanel: 'stages',
    };
  }

  handleToggleActivePanel = (activePanel) => {
    this.setState({ activePanel });
  }

  render() {
    const {
      isOpen,
      handleCloseMenu,
      handleReturnToStart,
    } = this.props;

    return (
      <div className={cx('menu-container', { 'menu-container--show': isOpen })}>
        <div className="menu-container__content">
          <div className="menu-container__header">
            <Icon name="close" onClick={handleCloseMenu} />
          </div>
          <div className="menu-container__panels">
            <div className="menu-panels">
              <div
                className={cx(
                  'menu-panel',
                  'menu-panel__settings',
                  { 'menu-panel--active': this.state.activePanel === 'settings' },
                )}
              >
                <SettingsMenu
                  active={this.state.activePanel === 'settings'}
                  onClickInactive={() => this.handleToggleActivePanel('settings')}
                />
              </div>
              <div
                className={cx(
                  'menu-panel',
                  'menu-panel__stages',
                  { 'menu-panel--active': this.state.activePanel === 'stages' },
                )}
              >
                <StagesMenu
                  active={this.state.activePanel === 'stages'}
                  onClickInactive={() => this.handleToggleActivePanel('stages')}
                />
              </div>
            </div>
          </div>
          <div className="menu-container__footer">
            <Button color="neon-coral" onClick={handleReturnToStart}>Return to start screen</Button>
          </div>
        </div>
      </div>
    );
  }
}

MainMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleCloseMenu: PropTypes.func.isRequired,
  handleReturnToStart: PropTypes.func.isRequired,
};

export default MainMenu;
