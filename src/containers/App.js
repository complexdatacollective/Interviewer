import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
<<<<<<< HEAD
import { sessionMenuIsOpen, stageMenuIsOpen } from '../selectors/session';
import { SessionMenu, StageMenu } from '.';
=======
import cx from 'classnames';

import { menuIsOpen } from '../selectors/session';
import { StageMenu } from '.';
>>>>>>> master

require('../styles/main.scss');

/**
  * Main app container.
  * @param props {object} - children
  */
const App = props => (
  <div id="outer-container">
    <SessionMenu hideButton={props.isMenuOpen} />
    <StageMenu hideButton={props.isMenuOpen} />
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
