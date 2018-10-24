import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { reset } from 'redux-form';
import PropTypes from 'prop-types';
import { pick, map } from 'lodash';
import { createSelector } from 'reselect';
import cx from 'classnames';

import { Button, ToggleInput } from '../ui/components';
import { actionCreators as modalActions } from '../ducks/modules/modals';
import { nodeAttributesProperty } from '../ducks/modules/network';
import { Form, FormWizard } from '../containers/';
import { Modal } from '../components/';
import { makeRehydrateFields } from '../selectors/forms';

const propNodeAttributes = (_, props) => props.node && props.node[nodeAttributesProperty];

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
    propNodeAttributes,
    (fields, values, nodeAttributes) => ({ ...values, ...pick(nodeAttributes, fields) }),
  );

/**
  * Modal Node Form, than can handle new/editing of nodes
  * @extends Component
  */
class NodeForm extends Component {
  constructor(props) {
    super(props);
    this.modalRef = React.createRef();
    this.state = {
      addAnotherNode: false,
    };
  }

  onSubmit = (formData, dispatch, form) => {
    this.props.onSubmit(formData, dispatch, form);

    if (this.state.addAnotherNode) {
      this.props.resetValues(form.form);
      this.modalRef.current.scrollContentsToTop();
    } else {
      this.props.closeModal(this.props.name);
    }
  };

  onToggleClick = () => {
    this.setState({
      addAnotherNode: !this.state.addAnotherNode,
    });
  }

  render() {
    const {
      name,
      title,
      showAddAnotherToggle,
      useFullScreenForms,
    } = this.props;

    const modalClassNames = cx({ 'modal--fullscreen': useFullScreenForms });

    const formProps = {
      ...this.props,
      autoFocus: true,
      controls: [
        (showAddAnotherToggle && <ToggleInput
          key="toggleInput"
          name="addAnother"
          label="Add another?"
          checked={this.state.addAnotherNode}
          onCheck={this.onToggleClick}
          inline
        />),
        <Button key="submit" aria-label="Submit">Finished</Button>,
      ],
      form: name.toString(),
      onSubmit: this.onSubmit,
    };

    const formElement = useFullScreenForms ?
      (<FormWizard
        {...formProps}
      />) :
      (<Form
        {...formProps}
      />);

    return (
      <Modal name={name} title={title} className={modalClassNames} ref={this.modalRef}>
        {formElement}
      </Modal>
    );
  }
}

NodeForm.propTypes = {
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
  node: PropTypes.object,
  openModal: PropTypes.func.isRequired,
  resetValues: PropTypes.func.isRequired,
  showAddAnotherToggle: PropTypes.bool,
  useFullScreenForms: PropTypes.bool.isRequired,
};

NodeForm.defaultProps = {
  showAddAnotherToggle: false,
  node: {},
};

function makeMapStateToProps() {
  const getInitialValuesFromProps = makeGetInitialValuesFromProps();

  return function mapStateToProps(state, props) {
    return {
      initialValues: getInitialValuesFromProps(state, props),
      useFullScreenForms: state.deviceSettings.useFullScreenForms,
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
