import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { reset } from 'redux-form';
import { isEmpty } from 'lodash';
import Overlay from './Overlay';
import Form from './Form';
import FormWizard from './FormWizard';
import { Button, ToggleInput } from '../ui/components';
import { protocolForms } from '../selectors/protocol';
import { nodeAttributesProperty } from '../ducks/modules/network';

const reduxFormName = 'NODE_FORM';

const notEmpty = (...args) => !isEmpty(...args);

class NodeForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      addAnotherNode: false,
    };

    this.overlay = React.createRef();
  }

  onToggleClick = () => {
    this.setState({
      addAnotherNode: !this.state.addAnotherNode,
    });
  }

  handleSubmit = (form) => {
    this.props.onSubmit({ form, addAnotherNode: this.state.addAnotherNode });
    this.overlay.current.getWrappedInstance().scrollContentsToTop();
    this.props.resetValues(reduxFormName);
  }

  render() {
    const { show, form, initialValues } = this.props;

    const formProps = {
      ...form,
      initialValues,
      onSubmit: this.handleSubmit,
      autoFocus: true,
      controls: [
        (form && form.optionToAddAnother && <ToggleInput
          key="toggleInput"
          name="addAnother"
          label="Add another?"
          checked={this.state.addAnotherNode}
          onCheck={this.onToggleClick}
          inline
        />),
        <Button type="submit" key="submit" aria-label="Submit">Finished</Button>,
      ].filter(notEmpty),
      form: reduxFormName,
    };

    return (
      <Overlay
        show={show}
        title={form.title}
        ref={this.overlay}
        onClose={this.props.onClose}
      >
        { this.props.useFullScreenForms ?
          <FormWizard
            {...formProps}
          /> :
          <Form
            {...formProps}
          />
        }
      </Overlay>
    );
  }
}

const mapStateToProps = (state, props) => {
  const forms = protocolForms(state);
  const nodeAttributes = props.node ? props.node[nodeAttributesProperty] : {};

  const initialValues = {
    ...nodeAttributes,
  };

  return {
    form: forms[props.stage.form],
    useFullScreenForms: state.deviceSettings.useFullScreenForms,
    initialValues,
  };
};

const mapDispatchToProps = dispatch => ({
  resetValues: bindActionCreators(reset, dispatch),
});

export { NodeForm };

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(NodeForm);
