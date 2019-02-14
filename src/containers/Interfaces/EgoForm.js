import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { isValid, isSubmitting, submit } from 'redux-form';
import ReactMarkdown from 'react-markdown';

import { ProgressBar, Scroller } from '../../components';
import { Form } from '../../containers';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { protocolForms } from '../../selectors/protocol';
import { networkEgo } from '../../selectors/interface';
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

const FORM_NAME = 'EGO_FORM';

class EgoForm extends Component {
  constructor(props) {
    super(props);
    this.scrollerRef = React.createRef();
    this.state = {
      scrollProgress: 0,
    };
  }

  formSubmitAllowed = () => (
    this.props.formEnabled(this.props.form)
  );

  isStageBeginning = () => (
    this.state.scrollProgress === 0
  );

  isStageEnding = () => this.props.formEnabled();

  clickNext = () => {
    this.props.submitForm();
  };

  clickPrevious = () => {
    if (this.formSubmitAllowed()) {
      this.props.submitForm();
    }
  };

  handleSubmitForm = (formData) => {
    this.props.updateEgo({}, formData);
  }

  handleScroll = () => {
    const element = document.getElementsByClassName('scrollable')[0];
    const currentScrollPosition = element.scrollTop;
    const maxScrollPosition = element.scrollHeight - element.clientHeight;

    const scrollPercent = currentScrollPosition / maxScrollPosition;
    this.setState({
      scrollProgress: scrollPercent,
    });
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
        'progress-container--show': this.state.scrollProgress > 0,
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
              controls={[]}
              autoFocus={false}
              form={FORM_NAME}
              onSubmit={this.handleSubmitForm}
            />
          </Scroller>
        </div>
        <div className={progressClasses}>
          { this.state.scrollProgress === 1 && (<span className="progress-container__status-text">Click next to continue</span>)}
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
  submitForm: PropTypes.func.isRequired,
  updateEgo: PropTypes.func.isRequired,
};

EgoForm.defaultProps = {
  ego: {},
};

function mapStateToProps(state, props) {
  const forms = protocolForms(state);
  const ego = networkEgo(state);
  return {
    form: forms[props.stage.form],
    introductionPanel: props.stage.introductionPanel,
    ego,
    formEnabled: () => isValid(FORM_NAME)(state) && !isSubmitting(FORM_NAME)(state),
  };
}

const mapDispatchToProps = dispatch => ({
  updateEgo: bindActionCreators(sessionsActions.updateEgo, dispatch),
  submitForm: bindActionCreators(() => submit(FORM_NAME), dispatch),
});

export { EgoForm };

export default compose(
  connect(mapStateToProps, mapDispatchToProps, null, { withRef: true }),
)(EgoForm);
