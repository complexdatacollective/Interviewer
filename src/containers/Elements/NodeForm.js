/* eslint-disable no-shadow, react/no-unused-prop-types */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { map, pick } from 'lodash';
import { createSelector } from 'reselect';
import { actionCreators as modalActions } from '../../ducks/modules/modals';
import { Form } from '../../containers/Elements';
import { Modal } from '../../components/Elements';

const fieldNames = (_, props) => map(props.form.fields, 'name');
const node = (_, props) => props.node;

const initialValues = createSelector(
  fieldNames,
  node,
  (fieldNames, node) => pick(node, fieldNames),
);

/**
  * Modal Node Form, than can handle new/editing of nodes
  * @extends Component
  */
class NodeForm extends Component {
  onSubmit = (formData, dispatch, form) => {
    this.props.closeModal(this.props.modalName);
    this.props.handleSubmit(formData, dispatch, form);
  }

  render() {
    const {
      modalName,
      form,
      initialValues,
    } = this.props;

    return (
      <Modal name={modalName} title={form.title}>
        <Form
          {...form}
          initialValues={initialValues}
          autoFocus
          form={form.name}
          onSubmit={this.onSubmit}
        />
      </Modal>
    );
  }
}

NodeForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  initialValues: PropTypes.any.isRequired,
  modalName: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.symbol,
  ]).isRequired,
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

function mapDispatchToProps(dispatch) {
  return {
    closeModal: bindActionCreators(modalActions.closeModal, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeForm);
