/* eslint-disable no-shadow, react/no-unused-prop-types */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { reset } from 'redux-form';
import PropTypes from 'prop-types';
import { map, pick } from 'lodash';
import { createSelector } from 'reselect';
import { Icon } from 'network-canvas-ui';
import { actionCreators as modalActions } from '../../ducks/modules/modals';
import { Form } from '../../containers/Elements';
import { Modal, Pips } from '../../components/Elements';

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
  constructor(props) {
    super(props);
    this.state = {
      fieldIndex: 0,
      typeOfSubmit: 'normal',
    };
  }

  onSubmit = (formData, dispatch, form) => {
    this.close();
    this.props.handleSubmit(formData, dispatch, form);
    if (this.state.typeOfSubmit === 'continuous') {
      this.props.resetValues(form.form);
      this.props.openModal(this.props.modalName);
    }
  };

  nextField = () => {
    const count = this.props.form.fields.length;
    this.setState({
      fieldIndex: (this.state.fieldIndex + 1 + count) % count,
    });
  }

  previousField = () => {
    const count = this.props.form.fields.length;
    this.setState({
      fieldIndex: (this.state.fieldIndex - 1 + count) % count,
    });
  }

  continuousSubmit = () => {
    this.setState({
      typeOfSubmit: 'continuous',
    }, this.submit);
  };

  normalSubmit = () => {
    this.setState({
      typeOfSubmit: 'normal',
    }, this.submit);
  };


  close = () => {
    this.props.closeModal(this.props.modalName);
    this.setState({
      fieldIndex: 0,
    });
  }

  render() {
    const {
      modalName,
      form,
      initialValues,
      addAnother,
    } = this.props;

    const large = window.matchMedia('screen and (min-device-aspect-ratio: 16/9)').matches;

    const previousElement = (
      <div>
        {this.state.fieldIndex !== 0 && <Icon name="form-arrow-left" onClick={this.previousField} />}
      </div>);
    const lastField = this.state.fieldIndex === form.fields.length - 1;
    const nextElement = lastField || large ? null :
      (<Icon name="form-arrow-right" />);

    return (
      <Modal name={modalName} title={form.title} close={this.close} className={large ? '' : 'modal--mobile'}>
        { !large && <div className="modal__pips">
          <Pips count={form.fields.length} currentIndex={this.state.fieldIndex} />
        </div>}
        <Form
          fields={large ? form.fields : [form.fields[this.state.fieldIndex]]}
          autoPopulate={form.autoPopulate}
          initialValues={initialValues}
          autoFocus
          form={form.name}
          onSubmit={lastField || large ? this.onSubmit : this.nextField}
          addAnother={addAnother}
          continuousSubmit={this.continuousSubmit}
          normalSubmit={this.normalSubmit}
          next={nextElement}
          previous={previousElement}
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
