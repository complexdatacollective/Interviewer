/* eslint-disable no-shadow, react/no-unused-prop-types */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { reset } from 'redux-form';
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
    if (this.state.typeOfSubmit === 'continuous') {
      this.props.resetValues(form.name);
      this.setState({ typeOfSubmit: 'normal' }, form.blur);
      this.props.openModal(this.props.modalName);
    }
  };

  continuousSubmit = () => {
    this.setState({
      typeOfSubmit: 'continuous',
    }, this.submit);
  };

  render() {
    const {
      modalName,
      form,
      initialValues,
      addAnother,
    } = this.props;

    return (
      <Modal name={modalName} title={form.title}>
        <Form
          {...form}
          initialValues={!addAnother ? initialValues : null}
          autoFocus
          form={form.name}
          onSubmit={this.onSubmit}
          addAnother={addAnother}
          continuousSubmit={this.continuousSubmit}
        />
      </Modal>
    );
  }
}

NodeForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  resetValues: PropTypes.func.isRequired,
  initialValues: PropTypes.any.isRequired,
  modalName: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.symbol,
  ]).isRequired,
  form: PropTypes.any.isRequired,
  node: PropTypes.any,
  addAnother: PropTypes.bool,
};

NodeForm.defaultProps = {
  addAnother: false,
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
    openModal: bindActionCreators(modalActions.openModal, dispatch),
    resetValues: bindActionCreators(reset, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeForm);
