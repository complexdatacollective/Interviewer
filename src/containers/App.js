import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cx from 'classnames';

import { menuIsOpen } from '../selectors/session';
import { StageMenu } from '.';

require('../styles/main.scss');

/**
  * Main app container.
  * @param props {object} - children
  */
const App = props => (
  <div id="outer-container">
    <StageMenu />
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
    isMenuOpen: menuIsOpen(state),
  };
}

export default connect(mapStateToProps)(App);
