import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { isValid, isSubmitting, submit } from 'redux-form';

import { ProgressBar, Scroller } from '../../components';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { protocolForms } from '../../selectors/protocol';
import { networkEgo } from '../../selectors/interface';
import { nodeAttributesProperty } from '../../ducks/modules/network';
import { Node as UINode } from '../../ui/components';
import { Form } from '../';

const nodeFormName = 'EGO_FORM';
const rotateIndex = (max, nextIndex) => (nextIndex + max) % max;

class EgoForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0,
    };
  }

  formSubmitAllowed = () => this.props.formEnabled(nodeFormName);

  isStageBeginning = () => (
    this.state.activeIndex === 0
  );

  isStageEnding = () => (
    this.formSubmitAllowed() &&
      this.state.activeIndex === this.props.egoFormNames.length - 1
  );

  clickNext = () => {
    this.props.submitForm(nodeFormName);
    if (this.formSubmitAllowed()) {
      this.setState({
        activeIndex: rotateIndex(this.props.egoFormNames.length, this.state.activeIndex + 1),
      });
    }
  };

  clickPrevious = () => {
    if (this.formSubmitAllowed()) {
      this.props.submitForm(nodeFormName);
    }
    this.setState({
      activeIndex: rotateIndex(this.props.egoFormNames.length, this.state.activeIndex - 1),
    });
  };

  handleSubmitForm = formData => this.props.updateEgo(this.props.ego, formData);

  render() {
    const {
      allForms,
      egoFormNames,
      ego,
    } = this.props;

    return (
      <div className="ego-form">
        <div className="ego-form__content">
          <div className="slide-content">
            <UINode {...ego} label="You" />
            <div className="ego-form__form-container">
              <Scroller>
                <Form
                  {...allForms[egoFormNames[this.state.activeIndex]]}
                  className="ego-form__form"
                  initialValues={ego[nodeAttributesProperty]}
                  controls={[]}
                  autoFocus={false}
                  form={nodeFormName}
                  onSubmit={formData => this.handleSubmitForm(formData)}
                />
              </Scroller>
            </div>
          </div>
        </div>
        <div className="progress-container">
          <h6 className="progress-container__status-text">
            <strong>{this.state.activeIndex + 1}</strong> of <strong>{egoFormNames.length}</strong>
          </h6>
          <ProgressBar
            orientation="horizontal"
            percentProgress={(this.state.activeIndex / (egoFormNames.length - 1)) * 100}
          />
        </div>
      </div>
    );
  }
}

EgoForm.propTypes = {
  allForms: PropTypes.object,
  egoFormNames: PropTypes.array,
  ego: PropTypes.object.isRequired,
  formEnabled: PropTypes.func.isRequired,
  stage: PropTypes.object.isRequired,
  submitForm: PropTypes.func.isRequired,
  updateEgo: PropTypes.func.isRequired,
};

EgoForm.defaultProps = {
  egoFormNames: [],
  allForms: {},
};

function mapStateToProps(state, ownProps) {
  return {
    allForms: protocolForms(state),
    egoFormNames: ownProps.stage.egoForms,
    ego: networkEgo(state),
    formEnabled: formName => isValid(formName)(state) && !isSubmitting(formName)(state),
  };
}

const mapDispatchToProps = dispatch => ({
  updateEgo: bindActionCreators(sessionsActions.setEgo, dispatch),
  submitForm: bindActionCreators(formName => submit(formName), dispatch),
});

export { EgoForm };

export default compose(
  connect(mapStateToProps, mapDispatchToProps, null, { withRef: true }),
)(EgoForm);
