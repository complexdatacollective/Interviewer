import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import cx from 'classnames';
import { sessionMenuIsOpen, stageMenuIsOpen } from '../selectors/session';
import { SessionMenu, StageMenu } from '.';
import { provideDragContext } from '../behaviours/DragAndDrop/DragContext';

console.log(provideDragContext, 'CONTEXT');

require('../styles/main.scss');

/**
  * Main app container.
  * @param props {object} - children
  */
const App = props => (
  <div className={cx({
    app: true,
    'app--session': props.isSessionMenu,
  })}
  >
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
  isSessionMenu: PropTypes.bool,
};

App.defaultProps = {
  children: null,
  isMenuOpen: false,
  isSessionMenu: false,
};

function mapStateToProps(state) {
  return {
    isMenuOpen: sessionMenuIsOpen(state) || stageMenuIsOpen(state),
    isSessionMenu: sessionMenuIsOpen(state),
  };
}

export default compose(
  connect(mapStateToProps),
  provideDragContext(),
)(App);
