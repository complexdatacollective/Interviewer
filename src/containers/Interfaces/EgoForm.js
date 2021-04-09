import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { clamp } from 'lodash';
import { connect } from 'react-redux';
import { ProgressBar, Scroller } from '@codaco/ui';
import { ALLOWED_MARKDOWN_TAGS } from '@codaco/ui/src/utils/config';
import { submit, isValid, isDirty } from 'redux-form';
import ReactMarkdown from 'react-markdown';
import { isIOS } from '../../utils/Environment';
import Form from '../Form';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { getNetworkEgo } from '../../selectors/network';
import { getSessionProgress } from '../../selectors/session';
import defaultMarkdownRenderers from '../../utils/markdownRenderers';
import { entityAttributesProperty } from '../../ducks/modules/network';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';

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
    const { registerBeforeNext } = this.props;
    registerBeforeNext(this.beforeNext);
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
    const {
      submitForm,
      formName,
    } = this.props;
    submitForm(formName);
  };

  confirmIfChanged = () => {
    const {
      isFormDirty,
      openDialog,
    } = this.props;
    if (!isFormDirty()) { return Promise.resolve(true); }
    return openDialog(confirmDialog);
  };

  handleConfirmNavigation = (confirm) => {
    const { onComplete } = this.props;
    if (confirm) {
      onComplete();
      return;
    }

    this.submitForm();
  };

  handleSubmitForm = (formData) => {
    const { updateEgo, onComplete } = this.props;
    updateEgo({}, formData);
    onComplete();
  }

  handleScroll = (scrollTop, newScrollProgress) => {
    const { scrollProgress } = this.state;
    // iOS inertial scrolling takes values out of range
    const clampedScrollProgress = clamp(newScrollProgress, 0, 1);

    if (scrollProgress !== clampedScrollProgress) {
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

    const { scrollProgress } = this.state;

    const progressClasses = cx(
      'progress-container',
      {
        'progress-container--show': isIOS() || scrollProgress > 0,
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
          { (!isIOS() && scrollProgress === 1) && (<span className="progress-container__status-text">&#10003; When ready, click next to continue...</span>)}
          <ProgressBar
            orientation="horizontal"
            percentProgress={scrollProgress * 100}
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
