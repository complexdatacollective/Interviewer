import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon, Modal } from '@codaco/ui';
import { isCordova } from '../../utils/Environment';
import StagesMenu from '../../containers/MainMenu/StagesMenu';
import SettingsMenu from '../../containers/MainMenu/SettingsMenu';

class MainMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activePanel: 'stages',
    };
  }

  showExitButton = () => !isCordova() || (navigator.app && navigator.app.exitApp);

  handleExitApp = () => {
    this.props.openDialog({
      type: 'Warning',
      title: 'Exit Network Canvas?',
      confirmLabel: 'Exit',
      onConfirm: this.exitApp,
      message: (
        <p>
          Are you sure you want to exit Network Canvas?
        </p>
      ),
    });
  }

  exitApp = () => {
    if (isCordova()) {
      // Android supports exiting
      if (navigator.app && navigator.app.exitApp) {
        navigator.app.exitApp();
      }
    } else {
      // note: this will only close windows opened by the app, not a new tab the user opened
      window.close();
    }
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
      <Modal show={isOpen}>
        <div className="main-menu__content">
          <div className="main-menu__header">
            <div className="main-menu__return-button" onClick={handleReturnToStart}>&#8592; Return to start screen</div>
            {this.showExitButton() && <div className="main-menu__exit-button" onClick={this.handleExitApp}>
              Exit Network Canvas
              <Icon name="menu-quit" />
            </div>}
          </div>
          <div className="main-menu__panels">
            <SettingsMenu
              active={this.state.activePanel === 'settings' || !(this.props.sessionLoaded && this.state.activePanel === 'stages')}
              onClickInactive={() => this.handleToggleActivePanel('settings')}
              onCloseMenu={handleCloseMenu}
            />
            { this.props.sessionLoaded && (
              <StagesMenu
                active={this.props.sessionLoaded && this.state.activePanel === 'stages'}
                onClickInactive={() => this.handleToggleActivePanel('stages')}
                onCloseMenu={handleCloseMenu}
              />
            )}
          </div>
        </div>
      </Modal>
    );
  }
}

MainMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  sessionLoaded: PropTypes.bool.isRequired,
  handleCloseMenu: PropTypes.func.isRequired,
  handleReturnToStart: PropTypes.func.isRequired,
  openDialog: PropTypes.func.isRequired,
};

export default MainMenu;
