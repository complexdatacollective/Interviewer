import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { reset } from 'redux-form';
import PropTypes from 'prop-types';
import { pick, map } from 'lodash';
import { createSelector } from 'reselect';
import cx from 'classnames';
import { Icon } from 'network-canvas-ui';
import { actionCreators as modalActions } from '../../ducks/modules/modals';
import { Form } from '../../containers/Elements';
import { Modal, Pips } from '../../components/Elements';
import { makeRehydrateFields } from '../../selectors/rehydrate';

const propNode = (_, props) => props.node;

const makePropFieldVariables = () =>
  createSelector(
    makeRehydrateFields(),
    fields => map(fields, 'name'),
  );

const makeGetInitialValuesFromProps = () =>
  createSelector(
    makePropFieldVariables(),
    propNode,
    (fields, node) => pick(node, fields),
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
    if (this.shouldShowNextField()) {
      this.nextField();
      return;
    }

    this.close();
    this.props.handleSubmit(formData, dispatch, form);
    if (this.state.typeOfSubmit === 'continuous') {
      this.props.resetValues(form.form);
      this.props.openModal(this.props.name);
    }
  };

  getFields = () => (
    this.isLarge() ? this.props.fields : [this.props.fields[this.state.fieldIndex]]
  );

  nextField = () => {
    const count = this.props.fields.length;
    this.setState({
      fieldIndex: (this.state.fieldIndex + 1 + count) % count,
    });
  };

  previousField = () => {
    const count = this.props.fields.length;
    this.setState({
      fieldIndex: (this.state.fieldIndex - 1 + count) % count,
    });
  };

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
    this.props.closeModal(this.props.name);
    this.setState({
      fieldIndex: 0,
    });
  };

  isLarge = () => window.matchMedia('screen and (min-device-aspect-ratio: 16/9)').matches;

  shouldShowNextField = () => {
    const showingLastField = this.state.fieldIndex === this.props.fields.length - 1;
    return !this.isLarge() && !showingLastField;
  }

  render() {
    const {
      title,
      fields,
      autoPopulate,
      name,
      addAnother,
      initialValues,
    } = this.props;

    const modalClassNames = cx({ 'modal--mobile': !this.isLarge() });

    const previousElement = (
      <div>
        {this.state.fieldIndex !== 0 && <Icon name="form-arrow-left" onClick={this.previousField} />}
      </div>);
    const nextElement = this.shouldShowNextField() ? (<Icon name="form-arrow-right" />) : null;

    return (
      <Modal name={name} title={title} close={this.close} className={modalClassNames}>
        { !this.isLarge() && <div className="modal__pips">
          <Pips count={fields.length} currentIndex={this.state.fieldIndex} />
        </div>}
        <Form
          fields={this.getFields()}
          autoPopulate={autoPopulate}
          initialValues={initialValues}
          autoFocus
          form={name.toString()}
          onSubmit={this.onSubmit}
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
  name: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.symbol,
  ]).isRequired,
  title: PropTypes.string.isRequired,
  fields: PropTypes.array.isRequired,
  autoPopulate: PropTypes.func,
  node: PropTypes.any, // eslint-disable-line react/no-unused-prop-types
  addAnother: PropTypes.bool,
};

NodeForm.defaultProps = {
  addAnother: false,
  autoPopulate: () => {},
  node: {},
};

function makeMapStateToProps() {
  const getInitialValuesFromProps = makeGetInitialValuesFromProps();

  return function mapStateToProps(state, props) {
    return {
      initialValues: getInitialValuesFromProps(state, props),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    closeModal: bindActionCreators(modalActions.closeModal, dispatch),
    openModal: bindActionCreators(modalActions.openModal, dispatch),
    resetValues: bindActionCreators(reset, dispatch),
  };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(NodeForm);
