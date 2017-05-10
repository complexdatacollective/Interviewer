import React, { Component } from 'react';

import { MenuItem } from './Elements';

class MenuFactory extends Component {
  constructor(props) {
    super(props);
    const initialIsOpenProp = props && typeof props.isOpen !== 'undefined';

    this.state = {
      isOpen: initialIsOpenProp ? this.props.isOpen : false
    };

    this.toggleMenu = this.toggleMenu.bind(this);
    this.listenForClose = this.listenForClose.bind(this);
    this.menuItemClick = this.menuItemClick.bind(this);
  }

  // Sets or unsets styles on DOM elements outside the menu component.
  // This is necessary for correct page interaction with some of the menus.
  // Throws and returns if the required external elements don't exist,
  // which means any external page animations won't be applied.
  componentWillUpdate(nextProps,nextState) {
    console.log('handleExternalWrapper');

    const wrapper = document.getElementById('page-wrap');

    console.log(wrapper.className);
    wrapper.className = nextState.isOpen ? 'isOpen' : '';
  }

  componentWillMount() {
    // Allow initial open state to be set by props.
    if (this.props.isOpen) {
      this.toggleMenu();
    }
  }

  componentDidMount() {
    window.onkeydown = this.listenForClose;

    // Allow initial open state to be set by props for animations with wrapper elements.
    if (this.props.isOpen) {
      this.toggleMenu();
    }
  }

  componentWillUnmount() {
    window.onkeydown = null;
  }

  componentWillReceiveProps(nextProps) {
    if (typeof nextProps.isOpen !== 'undefined' && nextProps.isOpen !== this.state.isOpen) {
      this.toggleMenu();
    }
  }

  toggleMenu() {
    console.log('toggleMenu ', this.state.isOpen);

    this.setState({
      isOpen: !this.state.isOpen
    });
  }


  listenForClose(e) {
    e = e || window.event;

    if (this.state.isOpen && (e.key === 'Escape' || e.keyCode === 27)) {
      this.toggleMenu();
    }
  }

  menuItemClick(itemClick) {
    itemClick();
    this.toggleMenu();
  }

  render() {
    let items = this.props.items.map((item) =>
      <MenuItem key={item.id} to={item.to} onClick={() => this.menuItemClick(item.onClick)} title={item.title} />
      );

    return (
      <div>
        <div className="bm-overlay" onClick={this.toggleMenu} />
        <div id={this.props.id} className={this.state.isOpen ? 'bm-menu-wrap isOpen' : 'bm-menu-wrap'}>
          <div className="bm-menu">
            <div className="cross-icon">
              <button onClick={this.toggleMenu} className="ui large button">
                <i className="download icon"></i>
                Cross
              </button>
            </div>
            <header>
              <h1 className="bm-menu-title">Stages</h1>
            </header>
            {this.props.searchField}
            <nav className="bm-item-list">
              {items}
            </nav>
          </div>
        </div>
        <div className="burger-icon">
          <button onClick={this.toggleMenu} className="ui large button">
            <i className="download icon"></i>
            Burger
          </button>
        </div>
      </div>
    );
  } // end render
} //end class

export default MenuFactory;
