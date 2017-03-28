'use strict';

import React from 'react';

const MenuFactory = React.createClass({
  propTypes: {
    id: React.PropTypes.string,
    isOpen: React.PropTypes.bool,
  },

  toggleMenu() {
    console.log('toggleMenu ', this.state);

    const newState = { isOpen: !this.state.isOpen };

    console.log(newState);

    this.setState(newState);
  },

  // Sets or unsets styles on DOM elements outside the menu component.
  // This is necessary for correct page interaction with some of the menus.
  // Throws and returns if the required external elements don't exist,
  // which means any external page animations won't be applied.
  componentWillUpdate(nextProps,nextState) {
    console.log('handleExternalWrapper');

    const wrapper = document.getElementById('page-wrap');

    console.log(wrapper.className);
    wrapper.className = nextState.isOpen ? 'isOpen' : '';

  },

  listenForClose(e) {
    e = e || window.event;

    if (this.state.isOpen && (e.key === 'Escape' || e.keyCode === 27)) {
      this.toggleMenu();
    }
  },

  getInitialState() {
    const initialIsOpenProp = this.props && typeof this.props.isOpen !== 'undefined';
    return { isOpen: initialIsOpenProp ? this.props.isOpen : false };
  },

  componentWillMount() {
    // Allow initial open state to be set by props.
    if (this.props.isOpen) {
      this.toggleMenu();
    }
  },

  componentDidMount() {
    window.onkeydown = this.listenForClose;

    // Allow initial open state to be set by props for animations with wrapper elements.
    if (this.props.isOpen) {
      this.toggleMenu();
    }
  },

  componentWillUnmount() {
    window.onkeydown = null;
  },

  componentWillReceiveProps(nextProps) {
    if (typeof nextProps.isOpen !== 'undefined' && nextProps.isOpen !== this.state.isOpen) {
      this.toggleMenu();
    }
  },

  render() {
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
              <h1>Stages</h1>
            </header>
            <nav className="bm-item-list">
              {React.Children.map(this.props.children, (item, index) => {
                if (item) {
                  const extraProps = {
                    key: index
                  };
                  return React.cloneElement(item, extraProps);
                }
              })}
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
}); //end return


export default MenuFactory;
