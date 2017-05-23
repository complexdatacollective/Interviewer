/* eslint-disable */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { map, pick } from 'lodash';
import { createSelector } from 'reselect';
import {
  modalNames as modals,
} from '../../ducks/modules/modals';
import { Modal } from '../../containers/Elements';
import { Form } from '../../components/Elements';

const fieldNames = (_, props) => map(props.form.fields, 'name');
const node = (_, props) => props.node;

const initialValues = createSelector(
  fieldNames,
  node,
  (fieldNames, node) => pick(node, fieldNames),
);

/**
  * Form for editing existing nodes
  */
const FormEditNode = props => (
  <Modal name={modals.EDIT_NODE} title={props.form.title}>
    <Form {...props.form} initialValues={props.initialValues} form={props.form.formName} onSubmit={props.handleEditNode} />
  </Modal>
);

FormEditNode.propTypes = {
  handleEditNode: PropTypes.func.isRequired,
  fields: PropTypes.any.isRequired,
};

function mapStateToProps(state, ownProps) {
  return {
    initialValues: initialValues(null, ownProps),
  };
}

export default connect(mapStateToProps)(FormEditNode);
