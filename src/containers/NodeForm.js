import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { reset } from 'redux-form';
import PropTypes from 'prop-types';
import { pick, map } from 'lodash';
import { createSelector } from 'reselect';
import cx from 'classnames';

import { Button } from 'network-canvas-ui';
import { actionCreators as modalActions } from '../ducks/modules/modals';
import { Field, Form, FormWizard } from '../containers/';
import { Modal } from '../components/';
import { makeRehydrateFields } from '../selectors/forms';

const propNode = (_, props) => props.node;

const makePropFieldVariables = () =>
  createSelector(
    makeRehydrateFields(),
    fields => map(fields, 'name'),
  );

const makeGetPropFieldValues = () =>
  createSelector(
    makeRehydrateFields(),
    fields => Object.assign({}, ...fields.filter(field => field.value)
      .map(field => ({ [field.name]: field.value }))),
  );

const makeGetInitialValuesFromProps = () =>
  createSelector(
    makePropFieldVariables(),
    makeGetPropFieldValues(),
    propNode,
    (fields, values, node) => ({ ...values, ...pick(node, fields) }),
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
    this.props.closeModal(this.props.name);
    this.props.onSubmit(formData, dispatch, form);

    if (formData.addAnother) {
      this.props.resetValues(form.form);
      this.props.openModal(this.props.name);
    }
  };

  isLarge = () => window.matchMedia('screen and (min-device-aspect-ratio: 16/9)').matches;

  render() {
    const {
      name,
      title,
    } = this.props;

    const modalClassNames = cx({ 'modal--fullscreen': !this.isLarge() });

    const formProps = {
      ...this.props,
      autoFocus: true,
      controls: [
        <Field type="checkbox" component="ToggleInput" name="addAnother" label="Add another node after submit" />,
        <Button key="submit" aria-label="Submit" onClick={this.normalSubmit}>Submit</Button>,
      ],
      form: name.toString(),
      onSubmit: this.onSubmit,
      tooltip: this.isLarge() ? 'right' : 'bottom',
    };

    const formElement = this.isLarge() ?
      (<Form
        {...formProps}
      />) :
      (<FormWizard
        {...formProps}
      />);

    return (
      <Modal name={name} title={title} className={modalClassNames}>
        {formElement}
      </Modal>
    );
  }
}

NodeForm.propTypes = {
  addAnother: PropTypes.bool,
  closeModal: PropTypes.func.isRequired,
  fields: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any.isRequired,
  name: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.symbol,
  ]).isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  entity: PropTypes.string.isRequired,
  node: PropTypes.any, // eslint-disable-line react/no-unused-prop-types
  openModal: PropTypes.func.isRequired,
  resetValues: PropTypes.func.isRequired,
};

NodeForm.defaultProps = {
  addAnother: false,
  node: {},
};

function makeMapStateToProps() {
  const getInitialValuesFromProps = makeGetInitialValuesFromProps();

  return function mapStateToProps(state, props) {
    return {
      initialValues: {
        addAnother: true,
        ...getInitialValuesFromProps(state, props),
      },
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

export { NodeForm };

export default connect(makeMapStateToProps, mapDispatchToProps)(NodeForm);
