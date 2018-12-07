import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Icon } from '../../ui/components';
import StagesMenu from '../../containers/MainMenu/StagesMenu';
import SettingsMenu from '../../containers/MainMenu/SettingsMenu';

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
      <div className={cx('main-menu', { 'main-menu--show': isOpen })}>
        <div className="main-menu__content">
          <div className="main-menu__header">
            <div className="main-menu__return-button" onClick={handleReturnToStart}>&#8592; Return to start screen</div>
            <Icon name="close" onClick={handleCloseMenu} />
          </div>
          <div className="main-menu__panels">
            <SettingsMenu
              active={this.state.activePanel === 'settings' || !(this.props.sessionLoaded && this.state.activePanel === 'stages')}
              onClickInactive={() => this.handleToggleActivePanel('settings')}
            />
            { this.props.sessionLoaded && (
              <StagesMenu
                active={this.props.sessionLoaded && this.state.activePanel === 'stages'}
                onClickInactive={() => this.handleToggleActivePanel('stages')}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

MainMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  sessionLoaded: PropTypes.bool.isRequired,
  handleCloseMenu: PropTypes.func.isRequired,
  handleReturnToStart: PropTypes.func.isRequired,
};

export default MainMenu;
