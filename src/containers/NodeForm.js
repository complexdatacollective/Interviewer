import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { reset, submit } from 'redux-form';
import Overlay from './Overlay';
import Form from './Form';
import FormWizard from './FormWizard';
import { Button } from '../ui/components';
import { protocolForms } from '../selectors/protocol';
import { entityAttributesProperty } from '../ducks/modules/network';
import { Scroller } from '../components';

const reduxFormName = 'NODE_FORM';

class NodeForm extends Component {
  constructor(props) {
    super(props);

    this.overlay = React.createRef();
  }

  handleSubmit = (form) => {
    this.props.onSubmit({ form });
  }

  render() {
    const { show, form, initialValues } = this.props;

    const formProps = {
      ...form,
      initialValues,
      onSubmit: this.handleSubmit,
      autoFocus: true,
      form: reduxFormName,
    };

    return (
      <Overlay
        show={show}
        title={form.title}
        onClose={this.props.onClose}
        className="node-form"
      >
        { this.props.useFullScreenForms ?
          <FormWizard
            {...formProps}
          /> :
          <React.Fragment>
            <Scroller>
              <Form
                {...formProps}
              />
            </Scroller>
            <div className="node-form__footer">
              <Button key="submit" aria-label="Submit" onClick={this.props.submitForm}>Finished</Button>
            </div>
          </React.Fragment>
        }
      </Overlay>
    );
  }
}

const mapStateToProps = (state, props) => {
  const forms = protocolForms(state);
  const nodeAttributes = props.node ? props.node[entityAttributesProperty] : {};

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
  submitForm: bindActionCreators(() => submit(reduxFormName), dispatch),
});

export { NodeForm };

export default compose(
  connect(mapStateToProps),
)(NodeForm);
