import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cx from 'classnames';

import { sessionMenuIsOpen, stageMenuIsOpen } from '../selectors/session';
import { SessionMenu, StageMenu } from '.';

require('../styles/main.scss');

/**
  * Main app container.
  * @param props {object} - children
  */
const App = props => (
  <div className="app">
    <SessionMenu hideButton={props.isMenuOpen} />
    <StageMenu hideButton={props.isMenuOpen} />
    <div
      id="page-wrap"
      className={cx({
        app__content: true,
        'app__content--pushed': props.isMenuOpen,
      })}
    >
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
