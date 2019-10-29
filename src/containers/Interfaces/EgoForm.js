import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { clamp } from 'lodash';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { isValid, isSubmitting, submit } from 'redux-form';
import ReactMarkdown from 'react-markdown';
import { isIOS } from '../../utils/Environment';
import { ProgressBar, Scroller } from '../../components';
import { Form } from '../../containers';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { getNetworkEgo } from '../../selectors/network';
import defaultMarkdownRenderers from '../../utils/markdownRenderers';
import { entityAttributesProperty } from '../../ducks/modules/network';

const TAGS = [
  'break',
  'emphasis',
  'heading',
  'link',
  'list',
  'listItem',
  'paragraph',
  'strong',
  'thematicBreak',
];

const getFormName = index => `EGO_FORM_${index}`;

class EgoForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scrollProgress: 0,
    };
  }

  isStageBeginning = () =>
    this.state.scrollProgress === 0;

  isStageEnding = () =>
    this.props.canSubmitForm;

  // Called by ProtocolScreen
  beforeNext = () => {
    if (this.props.canSubmitForm) {
      this.props.submitForm(this.props.stageIndex);
    }
  };

  handleSubmitForm = (formData) => {
    const { updateEgo, onComplete } = this.props;
    updateEgo({}, formData);
    onComplete(); // report back to ProtocolScreen
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
                allowedTypes={TAGS}
                renderers={defaultMarkdownRenderers}
              />
            </div>
            <Form
              {...form}
              initialValues={ego[entityAttributesProperty]}
              form={getFormName(this.props.stageIndex)}
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
  formEnabled: PropTypes.func.isRequired,
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
  const isFormSubmitting = isSubmitting(formName)(state);

  return {
    form: props.stage.form,
    introductionPanel: props.stage.introductionPanel,
    ego,
    canSubmitForm: isFormValid && !isFormSubmitting,
  };
}

const mapDispatchToProps = dispatch => ({
  updateEgo: bindActionCreators(sessionsActions.updateEgo, dispatch),
  submitForm: bindActionCreators(index => submit(getFormName(index)), dispatch),
});

export { EgoForm };

export default compose(
  connect(mapStateToProps, mapDispatchToProps, null, { withRef: true }),
)(EgoForm);
