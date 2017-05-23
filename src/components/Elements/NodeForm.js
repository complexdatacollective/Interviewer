/* eslint-disable no-shadow, react/no-unused-prop-types */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { map, pick } from 'lodash';
import { createSelector } from 'reselect';
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
  * Modal Node Form
  */
const NodeForm = props => (
  <Modal name={props.modalName} title={props.form.title}>
    <Form
      {...props.form}
      initialValues={props.initialValues}
      form={props.form.formName}
      onSubmit={props.handleSubmit}
    />
  </Modal>
);

NodeForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any.isRequired,
  modalName: PropTypes.string.isRequired,
  form: PropTypes.any.isRequired,
  node: PropTypes.any,
};

NodeForm.defaultProps = {
  node: {},
};

function mapStateToProps(state, ownProps) {
  return {
    initialValues: initialValues(null, ownProps),
  };
}

export default connect(mapStateToProps)(NodeForm);
