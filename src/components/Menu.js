import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'network-canvas-ui';

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

  componentDidUpdate() {
    if (this.props.isOpen) {
      document.addEventListener('click', this.outsideClick);
    } else {
      document.removeEventListener('click', this.outsideClick);
    }
  }

  /**
    * removes listener for key events and click events to close Menu
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

  outsideClick = () => {
    this.props.toggleMenu();
  }

  menuClick = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.toggleMenu();
  }

  // intercepts click events; calls callback and toggles Menu open state
  menuItemClick = (itemClick) => {
    this.menuClick();
    itemClick();
  }

  render() {
    const { children, hideButton, icon, isOpen, items, searchField, title } = this.props;

    const menuItems = items.map(item =>
      (<MenuItem
        key={item.id}
        to={item.to}
        onClick={() => this.menuItemClick(item.onClick)}
        title={item.title}
        isActive={item.isActive}
        interfaceType={item.interfaceType}
        menuType={item.menuType}
      />),
    );

    return (
      <div className="menu" ref={(node) => { this.domNode = node; }}>
        <div className={isOpen ? 'menu__wrap menu__wrap--open' : 'menu__wrap'}>
          <div className="menu__content">
            <MenuContent
              items={menuItems}
              searchField={searchField}
              title={title}
              toggleMenu={this.menuClick}
            />
          </div>
        </div>
        {!hideButton && <div className="menu__burger" onClick={this.menuClick} tabIndex={0} role="menu">
          <Icon name={icon} />
        </div>}
        { children }
      </div>
    );
  } // end render
} // end class

MenuFactory.propTypes = {
  children: PropTypes.any,
  hideButton: PropTypes.bool,
  icon: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  items: PropTypes.array,
  title: PropTypes.string,
  toggleMenu: PropTypes.func.isRequired,
  searchField: PropTypes.object,
};

MenuFactory.defaultProps = {
  children: null,
  hideButton: false,
  icon: 'menu',
  items: [],
  searchField: null,
  title: 'Options',
};

export default MenuFactory;
