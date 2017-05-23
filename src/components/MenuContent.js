import React from 'react';
import PropTypes from 'prop-types';

import { scrollable } from '../behaviors';

/**
  * Renders the internal content of a menu
  * @param props {object}
  * props: searchField, items, toggleMenu
  * @return div
  */
function MenuContent(props) {
  return (
    <div>
      <div className="menu__cross">
        <button onClick={props.toggleMenu} className="ui large button">
          <i className="download icon"></i>
          Cross
        </button>
      </div>
      <header>
        <h1 className="menu__title">Stages</h1>
      </header>
      {props.searchField}
      <nav>
        {props.items}
      </nav>
    </div>
  );
}

MenuContent.propTypes = {
  items: PropTypes.array,
  searchField: PropTypes.object,
  toggleMenu: PropTypes.func.isRequired,
};

MenuContent.defaultProps = {
  items: [],
  searchField: null,
};

/**
  * Wrapper for menu content to allow scrolling
  */
export default scrollable(MenuContent);
