import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { sessionMenuIsOpen, stageMenuIsOpen } from '../selectors/session';
import { SessionMenu, StageMenu } from '.';

require('../styles/main.scss');

/**
  * Main app container.
  * @param props {object} - children
  */
const App = props => (
  <div id="outer-container">
    <div className="menu-container">
      <SessionMenu />
      <StageMenu />
    </div>
    <div id="page-wrap" className={props.isMenuOpen ? 'isOpen' : ''}>
      { props.children }
    </div>
  </div>
);

App.propTypes = {
  children: PropTypes.any,
  isMenuOpen: PropTypes.bool,
};

App.defaultProps = {
  children: null,
  isMenuOpen: false,
};

function mapStateToProps(state) {
  return {
    isMenuOpen: sessionMenuIsOpen(state) || stageMenuIsOpen(state),
  };
}

export default connect(mapStateToProps)(App);
