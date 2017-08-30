/* eslint-disable no-new-func */

import React from 'react';
import createReactClass from 'create-react-class';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators as networkActions } from '../ducks/modules/network';
import { actionCreators as modalActions } from '../ducks/modules/modals';
import { PromptSwiper, NodeProviderPanels, Modal } from '../containers/Elements';
import { NodeList, Form, DropZone } from '../components/Elements';

const actions = {
  network: networkActions,
  modal: modalActions,
};

const selectors = {
};

const elements = {
  PromptSwiper, NodeProviderPanels, Modal, NodeList, Form, DropZone,
};

const environment = {
  React,
  createReactClass,
  bindActionCreators,
  connect,
};

const api = {
  actions,
  selectors,
  elements,
};

export default protocol => (
  new Function(
    'environment',
    'api',
    protocol,
  )(
    environment,
    api,
  )
);
