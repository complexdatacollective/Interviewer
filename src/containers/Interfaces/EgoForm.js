import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { clamp } from 'lodash';
import { connect } from 'react-redux';
import { submit, isValid } from 'redux-form';
import ReactMarkdown from 'react-markdown';
import { isIOS } from '../../utils/Environment';
import { ProgressBar, Scroller } from '../../components';
import { Form } from '../../containers';
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

const getFormName = index =>
  `EGO_FORM_${index}`;

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

  beforeNext = (direction) => {
    const {
      isFirstStage,
      isFormValid,
      openDialog,
    } = this.props;

    const isBackwards = direction < 0;

    if (!isFirstStage && isBackwards && !isFormValid) {
      openDialog(confirmDialog)
        .then(this.handleConfirmNavigation);
      return;
    }

    this.submitForm();
  }

  submitForm = () => {
    this.props.submitForm(this.props.formName);
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
          <Scroller onScroll={this.handleScroll}>
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
          { (!isIOS() && this.state.scrollProgress === 1) && (<span className="progress-container__status-text">Click next to continue</span>)}
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
  const isFormValid = isValid(formName)(state);
  const { isFirstStage } = getSessionProgress(state);

  return {
    form: props.stage.form,
    introductionPanel: props.stage.introductionPanel,
    ego,
    isFormValid,
    formName,
    isFirstStage,
  };
}

const mapDispatchToProps = {
  updateEgo: sessionsActions.updateEgo,
  submitForm: submit,
  openDialog: dialogActions.openDialog,
};

const withStore = connect(mapStateToProps, mapDispatchToProps, null, { withRef: true });

export { EgoForm };

export default withStore(EgoForm);
