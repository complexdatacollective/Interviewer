import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { MenuContent } from '.';
import { MenuItem } from './Elements';

/**
  * Renders a menu, updating styles on DOM elements outside of this.
  * @extends Component
  */
class MenuFactory extends Component {
  /**
    * adds listener for key events to close Menu
    */
  componentDidMount() {
    window.onkeydown = this.listenForClose;
  }

  /**
    * adds listener for key events to close Menu
    */
  componentWillUnmount() {
    window.onkeydown = null;
  }

  listenForClose = (e) => {
    const event = e || window.event;

    if (this.props.isOpen && (event.key === 'Escape' || event.keyCode === 27)) {
      this.props.toggleMenu();
    }
  }

  // intercepts click events; calls callback and toggles Menu open state
  menuItemClick = (itemClick) => {
    itemClick();
    this.props.toggleMenu();
  }

  render() {
    const { isOpen, items, toggleMenu, searchField } = this.props;

    const menuItems = items.map(item =>
      (<MenuItem
        key={item.id}
        to={item.to}
        onClick={() => this.menuItemClick(item.onClick)}
        title={item.title}
        isActive={item.isActive}
        imageType={item.imageType}
      />),
    );

    return (
      <div className="menu">
        <div className={isOpen ? 'menu__wrap menu__wrap--isOpen' : 'menu__wrap'}>
          <div className="menu__content">
            <MenuContent
              toggleMenu={toggleMenu}
              searchField={searchField}
              items={menuItems}
            />
          </div>
        </div>
        {!isOpen && <div className="menu__burger">
          <button onClick={toggleMenu} className="ui large button">
            <i className="download icon" />
            Burger
          </button>
        </div>}
      </div>
    );
  } // end render
} // end class

MenuFactory.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  items: PropTypes.array,
  toggleMenu: PropTypes.func.isRequired,
  searchField: PropTypes.object,
};

MenuFactory.defaultProps = {
  items: [],
  searchField: null,
};

export default MenuFactory;
