import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { Icon } from '../../ui/components';

const MenuPanel = ({ active, onClickInactive, onCloseMenu, panel, children }) => {
  const handleClickInactive = !active ? onClickInactive : null;

  return (
    <div
      className={cx(
        'main-menu-menu-panel',
        {
          [`main-menu-menu-panel__${panel}`]: !!panel,
          'main-menu-menu-panel--active': active,
        },
      )}
      onClick={handleClickInactive}
    >
      <Icon name="close" onClick={onCloseMenu} />
      {children}
    </div>
  );
};

MenuPanel.propTypes = {
  children: PropTypes.node,
  active: PropTypes.bool,
  panel: PropTypes.string,
  onClickInactive: PropTypes.func,
  onCloseMenu: PropTypes.func,
};

MenuPanel.defaultProps = {
  children: null,
  active: false,
  panel: null,
  onClickInactive: () => {},
  onCloseMenu: () => {},
};

export default MenuPanel;
