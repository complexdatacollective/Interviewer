import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { reset } from 'redux-form';
import Overlay from '../components/Overlay';
import Form from './Form';
import FormWizard from './FormWizard';
import { Button, ToggleInput } from '../ui/components';
import { getDefaultFormValues } from '../selectors/forms';
import { protocolForms } from '../selectors/protocol';
import { nodeAttributesProperty } from '../ducks/modules/network';
import isLarge from '../utils/isLarge';

const reduxFormName = 'NODE_FORM';

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
    this.overlay.current.scrollContentsToTop();
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
        (form.optionToAddAnother && <ToggleInput
          key="toggleInput"
          name="addAnother"
          label="Add another?"
          checked={this.state.addAnotherNode}
          onCheck={this.onToggleClick}
          inline
        />),
        <Button key="submit" aria-label="Submit">Finished</Button>,
      ],
      form: reduxFormName,
    };

    return (
      <Overlay
        show={show}
        title={form.title}
        ref={this.overlay}
        onClose={this.props.onClose}
      >
        { isLarge() ?
          <Form
            {...formProps}
          /> :
          <FormWizard
            {...formProps}
          />
        }
      </Overlay>
    );
  }
}

const mapStateToProps = (state, props) => {
  const forms = protocolForms(state);
  const defaultFormValues = getDefaultFormValues(state);
  const nodeAttributes = props.node ? props.node[nodeAttributesProperty] : {};

  const initialValues = {
    ...defaultFormValues[props.stage.form],
    ...nodeAttributes,
  };

  return {
    form: forms[props.stage.form],
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
