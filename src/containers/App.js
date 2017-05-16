import React from 'react';
import PropTypes from 'prop-types';
import { StageMenu } from '.';

require('../styles/main.scss');

/**
  * Main app container.
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
      <div id="page-wrap" className="">
        { children }
      </div>
    </div>
  );
};

App.propTypes = {
  children: PropTypes.any,
  route: PropTypes.any.isRequired,
};

App.defaultProps = {
  children: null,
};

export default App;
