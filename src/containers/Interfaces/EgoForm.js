import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { clamp } from 'lodash';
import { connect } from 'react-redux';
import { ProgressBar, Scroller } from '@codaco/ui';
import { submit, isValid, isDirty } from 'redux-form';
import ReactMarkdown from 'react-markdown';
import { isIOS } from '../../utils/Environment';
import { Form } from '..';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { getNetworkEgo } from '../../selectors/network';
import { getSessionProgress } from '../../selectors/session';
import defaultMarkdownRenderers from '../../utils/markdownRenderers';
import { entityAttributesProperty } from '../../ducks/modules/network';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { ALLOWED_MARKDOWN_TAGS } from '../../config';

const confirmDialog = {
  type: 'Confirm',
  title: 'Discard changes?',
  message: 'This form contains invalid data, so it cannot be saved. If you continue it will be reset and your changes will be lost. Do you want to discard your changes?',
  confirmLabel: 'Discard changes',
};

const getFormName = (index) => `EGO_FORM_${index}`;

class EgoForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scrollProgress: 0,
    };
  }

  componentDidMount() {
    this.props.registerBeforeNext(this.beforeNext);
  }

  beforeNext = (direction, index = -1) => {
    const {
      isFirstStage,
      isFormValid,
    } = this.props;

    const isPendingStageChange = (index !== -1);
    const isBackwards = direction < 0;

    if (isPendingStageChange) {
      if (isFormValid()) {
        this.submitForm();
      } else {
        this.confirmIfChanged()
          .then(this.handleConfirmNavigation);
      }
      return;
    }

    if (!isFirstStage && isBackwards && !isFormValid()) {
      this.confirmIfChanged()
        .then(this.handleConfirmNavigation);
      return;
    }

    this.submitForm();
  }

  submitForm = () => {
    this.props.submitForm(this.props.formName);
  };

  confirmIfChanged = () => {
    if (!this.props.isFormDirty()) { return Promise.resolve(true); }
    return this.props.openDialog(confirmDialog);
  };

  handleConfirmNavigation = (confirm) => {
    if (confirm) {
      this.props.onComplete();
      return;
    }

    this.submitForm();
  };

  handleSubmitForm = (formData) => {
    const { updateEgo, onComplete } = this.props;
    updateEgo({}, formData);
    onComplete();
  }

  handleScroll = (scrollTop, scrollProgress) => {
    // iOS inertial scrolling takes values out of range
    const clampedScrollProgress = clamp(scrollProgress, 0, 1);

    if (this.state.scrollProgress !== clampedScrollProgress) {
      this.setState({ scrollProgress: clampedScrollProgress });
    }
  }

  render() {
    const {
      form,
      ego,
      introductionPanel,
      formName,
    } = this.props;

    const progressClasses = cx(
      'progress-container',
      {
        'progress-container--show': isIOS() || this.state.scrollProgress > 0,
      },
    );

    return (
      <div className="ego-form alter-form">
        <div className="ego-form__form-container">
          <Scroller className="ego-form__form-container-scroller" onScroll={this.handleScroll}>
            <div className="ego-form__introduction">
              <h1>{introductionPanel.title}</h1>
              <ReactMarkdown
                source={introductionPanel.text}
                allowedTypes={ALLOWED_MARKDOWN_TAGS}
                renderers={defaultMarkdownRenderers}
              />
            </div>
            <Form
              {...form}
              initialValues={ego[entityAttributesProperty]}
              form={formName}
              subject={{ entity: 'ego' }}
              onSubmit={this.handleSubmitForm}
            />
          </Scroller>
        </div>
        <div className={progressClasses}>
          { (!isIOS() && this.state.scrollProgress === 1) && (<span className="progress-container__status-text">&#10003; When ready, click next to continue...</span>)}
          <ProgressBar
            orientation="horizontal"
            percentProgress={this.state.scrollProgress * 100}
          />
        </div>
      </div>
    );
  }
}

EgoForm.propTypes = {
  form: PropTypes.object.isRequired,
  introductionPanel: PropTypes.object.isRequired,
  ego: PropTypes.object,
  stageIndex: PropTypes.number.isRequired,
  submitForm: PropTypes.func.isRequired,
  updateEgo: PropTypes.func.isRequired,
};

EgoForm.defaultProps = {
  ego: {},
};

function mapStateToProps(state, props) {
  const ego = getNetworkEgo(state);
  const formName = getFormName(props.stageIndex);
  const isFormValid = () => isValid(formName)(state);
  const isFormDirty = () => isDirty(formName)(state);
  const { isFirstStage } = getSessionProgress(state);

  return {
    form: props.stage.form,
    introductionPanel: props.stage.introductionPanel,
    ego,
    isFormValid,
    isFormDirty,
    formName,
    isFirstStage,
  };
}

const mapDispatchToProps = {
  updateEgo: sessionsActions.updateEgo,
  submitForm: submit,
  openDialog: dialogActions.openDialog,
};

const withStore = connect(mapStateToProps, mapDispatchToProps);

export { EgoForm };

export default withStore(EgoForm);
