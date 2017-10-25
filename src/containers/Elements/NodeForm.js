import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { reset } from 'redux-form';
import PropTypes from 'prop-types';
import { pick, map } from 'lodash';
import { createSelector } from 'reselect';
import cx from 'classnames';

import { actionCreators as modalActions } from '../../ducks/modules/modals';
import { Form, FormWizard } from '../../containers/Elements';
import { Modal } from '../../components/Elements';
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
      typeOfSubmit: 'normal',
    };
  }

  onSubmit = (formData, dispatch, form) => {
    this.close();
    this.props.handleSubmit(formData, dispatch, form);
    if (this.state.typeOfSubmit === 'continuous') {
      this.props.resetValues(form.form);
      this.props.openModal(this.props.name);
    }
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

    const props = {};
    props.fields = fields;
    props.autoPopulate = autoPopulate;
    props.initialValues = initialValues;
    props.autoFocus = true;
    props.form = name.toString();
    props.onSubmit = this.onSubmit;
    props.addAnother = addAnother;
    props.continuousSubmit = this.continuousSubmit;
    props.normalSubmit = this.normalSubmit;

    const formElement = this.isLarge() ?
      (<Form
        {...props}
      />) :
      (<FormWizard
        {...props}
      />);

    return (
      <Modal name={name} title={title} close={this.close} className={modalClassNames}>
        {formElement}
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
