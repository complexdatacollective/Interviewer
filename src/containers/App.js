import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { StageMenu } from '.';

require('../styles/main.scss');


const menuIsOpen = state => state.menu.menuIsOpen;

/**
  * Main app container.
  * @param props {object} - children
  */
const App = (props) => {
  let children = null;
  if (props.children) {
    children = React.cloneElement(props.children, {
      authService: props.route.authService,
      networkService: props.route.networkService,
    });
  }

  return (
    <div id="outer-container">
      <StageMenu />
      <div id="page-wrap" className={props.isMenuOpen ? 'isOpen' : ''}>
        { children }
      </div>
    </div>
  );
};

App.propTypes = {
  children: PropTypes.any,
  isMenuOpen: PropTypes.bool,
  route: PropTypes.any.isRequired,
};

App.defaultProps = {
  children: null,
  isMenuOpen: false,
};

function mapStateToProps(state) {
  return {
    isMenuOpen: menuIsOpen(state),
  };
}

export default connect(mapStateToProps)(App);
