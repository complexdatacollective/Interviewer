import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Menu } from '../components';

require('../styles/main.scss');

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
      <Menu>
        <Link to="/">Home Page</Link>
        <Link to="protocol">Access sample protocol</Link>
      </Menu>
      <div id="page-wrap" className="">
        { children }
      </div>
    </div>
  );
};

App.propTypes = {
  children: PropTypes.any.isRequired,
  route: PropTypes.any.isRequired,
};

export default App;
