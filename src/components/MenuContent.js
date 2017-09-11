import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'network-canvas-ui';

import { scrollable } from '../behaviours';

/**
  * Renders the internal content of a menu
  * @param props {object}
  * props: searchField, items, toggleMenu
  * @return div
  */
function MenuContent(props) {
  const { items, searchField, title, toggleMenu } = props;

  return (
    <div>
      <Icon name="close" size="40px" className="menu__cross" onClick={toggleMenu} />
      <header>
        <h1 className="menu__title">{title}</h1>
      </header>
      {searchField}
      <nav>
        {items}
      </nav>
    </div>
  );
}

MenuContent.propTypes = {
  items: PropTypes.array,
  searchField: PropTypes.object,
  title: PropTypes.string.isRequired,
  toggleMenu: PropTypes.func.isRequired,
};

MenuContent.defaultProps = {
  items: [],
  searchField: null,
};

/**
  * Wrapper for menu content to allow scrolling
  */
export default scrollable(MenuContent);
