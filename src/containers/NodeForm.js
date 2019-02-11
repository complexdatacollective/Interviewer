import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import Overlay from './Overlay';
import Form from './Form';
import FormWizard from './FormWizard';
import { Button } from '../ui/components';
import { protocolForms } from '../selectors/protocol';
import { entityAttributesProperty } from '../ducks/modules/network';

const reduxFormName = 'NODE_FORM';

const notEmpty = (...args) => !isEmpty(...args);

class NodeForm extends Component {
  constructor(props) {
    super(props);

    this.overlay = React.createRef();
  }

  handleSubmit = (form) => {
    this.props.onSubmit({ form });
    this.overlay.current.getWrappedInstance().scrollContentsToTop();
  }

  render() {
    const { show, form, initialValues } = this.props;

    const formProps = {
      ...form,
      initialValues,
      onSubmit: this.handleSubmit,
      autoFocus: true,
      controls: [
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

export { NodeForm };

export default compose(
  connect(mapStateToProps),
)(NodeForm);
