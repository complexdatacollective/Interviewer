import React from 'react';
import {
  Route,
  Switch,
  HashRouter as Router,
} from 'react-router-dom';
import App from './Views/App';
import PdfExport from './Views/PdfExport';

const ViewManager = () => (
  <Router>
    <Switch>
      <Route path="/#/pdf-export" component={PdfExport} />
      <Route path="/" component={App} />
    </Switch>
  </Router>
);

export default ViewManager;
