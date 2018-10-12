import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

const MenuPanel = ({ active, onClickInactive, panel, children }) => {
  const handleClickInactive = !active ? onClickInactive : null;

  return (
    <div
      className={cx(
        'menu-panel',
        {
          [`menu-panel__${panel}`]: !!panel,
          'menu-panel--active': active,
        },
      )}
      onClick={handleClickInactive}
    >
      {children}
    </div>
  );
};

MenuPanel.propTypes = {
  children: PropTypes.node,
  active: PropTypes.bool,
  panel: PropTypes.string,
  onClickInactive: PropTypes.func,
};

MenuPanel.defaultProps = {
  children: null,
  active: false,
  panel: null,
  onClickInactive: () => {},
};

export default MenuPanel;
