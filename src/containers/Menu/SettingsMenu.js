import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '../../ui/components';

// eslint-disable-next-line
class SettingsMenu extends Component {
  render() {
    const { active, onClickInactive } = this.props;
    const handleClickInactive = active ? onClickInactive : null;

    return (
      <React.Fragment>
        <Icon name="settings" />
        <div className="settings-menu" onClick={handleClickInactive}>
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

SettingsMenu.propTypes = {
  active: PropTypes.bool,
  onClickInactive: PropTypes.func,
};

SettingsMenu.defaultProps = {
  active: false,
  onClickInactive: () => {},
};

export default SettingsMenu;
