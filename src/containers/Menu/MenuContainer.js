import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { Button, Icon } from '../../ui/components';
import { StagesMenu, SettingsMenu } from '.';
import { actionCreators as uiActions } from '../../ducks/modules/ui';

class MenuContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activePanel: 'stages',
    };
  }

  toggleActivePanel = (activePanel) => {
    this.setState({ activePanel });
  }

  render() {
    return (
      <div className={cx('menu-container', { 'menu-container--show': this.props.isOpen })}>
        <div className="menu-container__content">
          <div className="menu-container__header">
            <Icon name="close" onClick={this.props.closeMenu} />
          </div>
          <div className="menu-container__panels">
            <div className="menu-panels">
              <div
                className={cx(
                  'menu-panel',
                  'menu-panel__settings',
                  { 'menu-panel--active': this.state.activePanel === 'settings' }
                )}
              >
                <SettingsMenu
                  active={this.state.activePanel === 'settings'}
                  onClickInactive={() => this.toggleActivePanel('settings')}
                />
              </div>
              <div
                className={cx(
                  'menu-panel',
                  'menu-panel__stages',
                  { 'menu-panel--active': this.state.activePanel === 'stages' }
                )}
              >
                <StagesMenu
                  active={this.state.activePanel === 'stages'}
                  onClickInactive={() => this.toggleActivePanel('stages')}
                />
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

const mapStateToProps = state => ({
  isOpen: state.ui.isMenuOpen,
});

const mapDispatchToProps = dispatch => ({
  closeMenu: () => dispatch(uiActions.update({ isMenuOpen: false })),
});

export { MenuContainer };

export default connect(mapStateToProps, mapDispatchToProps)(MenuContainer);
