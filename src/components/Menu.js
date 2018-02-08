import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'network-canvas-ui';
import { debounce } from 'lodash';
import { MenuItem, Scroller } from './';

const closeEvents = [
  'click',
  'touchstart',
];

/**
  * Renders a menu, updating styles on DOM elements outside of this.
  * @extends Component
  */
class MenuFactory extends Component {
  constructor(props) {
    super(props);

    this.outsideClick = debounce(this.outsideClick, 50);
  }

  /**
    * adds listener for key events to close Menu
    */
  componentDidMount() {
    window.onkeydown = this.listenForClose;
  }

  componentDidUpdate() {
    closeEvents.forEach((eventName) => {
      if (this.props.isOpen) {
        document.addEventListener(eventName, this.outsideClick);
      } else {
        document.removeEventListener(eventName, this.outsideClick);
      }
    });
  }

  /**
    * removes listener for key events and click events to close Menu
    */
  componentWillUnmount() {
    window.onkeydown = null;
    this.outsideClick.cancel();
  }

  listenForClose = (e) => {
    const event = e || window.event;

    if (this.props.isOpen && (event.key === 'Escape' || event.keyCode === 27)) {
      this.props.toggleMenu();
    }
  }

  outsideClick = (e) => {
    if (!this.domNode.contains(e.target)) {
      this.props.toggleMenu(e);
    }
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
    const { hideButton, icon, isOpen, items, searchField, title, children } = this.props;

    const menuItems = items.map(item =>
      (<MenuItem
        key={item.id}
        to={item.to}
        onClick={() => this.menuItemClick(item.onClick)}
        label={item.label}
        isActive={item.isActive}
        icon={item.icon}
        interfaceType={item.interfaceType}
        menuType={item.menuType}
      />),
    );

    return (
      <div className="menu" ref={(node) => { this.domNode = node; }}>
        {children}
        <div className={isOpen ? 'menu__wrap menu__content menu__wrap--open' : 'menu__wrap menu__content'}>
          <Scroller>
            <Icon name="close" size="40px" className="menu__cross" onClick={this.menuClick} />
            <header>
              <h1 className="menu__title">{title}</h1>
            </header>
            {searchField}
            <nav>
              {menuItems}
            </nav>
          </Scroller>
        </div>
        {!hideButton && <Icon name={icon} className="menu__burger" onClick={this.menuClick} />}
      </div>
    );
  } // end render
} // end class

MenuFactory.propTypes = {
  hideButton: PropTypes.bool,
  icon: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  items: PropTypes.array,
  title: PropTypes.string,
  toggleMenu: PropTypes.func.isRequired,
  searchField: PropTypes.object,
  children: PropTypes.node,
};

MenuFactory.defaultProps = {
  hideButton: false,
  icon: 'menu',
  items: [],
  searchField: null,
  title: 'Options',
  children: null,
};

export default MenuFactory;
