import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { isValid, isSubmitting, submit } from 'redux-form';
import { TransitionGroup } from 'react-transition-group';
import ReactMarkdown from 'react-markdown';

import { ProgressBar, Scroller } from '../../components';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { protocolForms } from '../../selectors/protocol';
import { networkEgo } from '../../selectors/interface';
import { nodeAttributesProperty } from '../../ducks/modules/network';
import { Node as UINode } from '../../ui/components';
import { Form } from '../';
import { Folder as FolderTransition } from '../../components/Transition';
import defaultMarkdownRenderers from '../../utils/markdownRenderers';

const rotateIndex = (max, nextIndex) => (nextIndex + max) % max;
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

class EgoForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0,
    };
  }

  getNodeFormName = () => `EGO_FORM_${this.state.activeIndex}`;

  formSubmitAllowed = () => this.props.formEnabled(this.getNodeFormName());

  isStageBeginning = () => (
    this.state.activeIndex === 0
  );

  isStageEnding = () => (
    this.formSubmitAllowed() &&
    this.state.activeIndex === this.props.egoFormNames.length
  );

  clickNext = () => {
    if (this.state.activeIndex > 0) {
      this.props.submitForm(this.getNodeFormName());
    }
    if (this.state.activeIndex > 0 || this.formSubmitAllowed()) {
      this.setState({
        activeIndex: rotateIndex(this.props.egoFormNames.length + 1, this.state.activeIndex + 1),
      });
    }
  };

  clickPrevious = () => {
    if (this.formSubmitAllowed()) {
      this.props.submitForm(this.getNodeFormName());
    }
    this.setState({
      activeIndex: rotateIndex(this.props.egoFormNames.length + 1, this.state.activeIndex - 1),
    });
  };

  handleSubmitForm = formData => this.props.updateEgo(this.props.ego, formData);

  render() {
    const {
      allForms,
      egoFormNames,
      ego,
      stage,
    } = this.props;

    const progressClasses = cx(
      'progress-container',
      {
        'progress-container--show': this.state.activeIndex > 0,
      },
    );

    return (
      <div className="ego-form">
        <div className="ego-form__content">
          { this.state.activeIndex === 0 && (
          <div>
            <div key="alter-form__introduction" className="slide-content alter-form__introduction">
              <h1>{stage.introductionPanel.title}</h1>
              <ReactMarkdown
                source={stage.introductionPanel.text}
                allowedTypes={TAGS}
                renderers={defaultMarkdownRenderers}
              />
            </div>
          </div>
          )}
          { this.state.activeIndex > 0 && (
          <div className="slide-content">
            <UINode {...ego} label="You" />
            <div className="ego-form__form-container">
              <TransitionGroup className="ego-form__transition">
                <FolderTransition key={`ego-${this.state.activeIndex - 1}`}>
                  <Scroller>
                    <Form
                      {...allForms[egoFormNames[this.state.activeIndex - 1]]}
                      className="ego-form__form"
                      initialValues={ego[nodeAttributesProperty]}
                      controls={[]}
                      autoFocus={false}
                      form={this.getNodeFormName()}
                      onSubmit={formData => this.handleSubmitForm(formData)}
                    />
                  </Scroller>
                </FolderTransition>
              </TransitionGroup>
            </div>
          </div>
          )}
        </div>
        <div className={progressClasses}>
          <h6 className="progress-container__status-text">
            <strong>{this.state.activeIndex}</strong> of <strong>{egoFormNames.length}</strong>
          </h6>
          <ProgressBar
            orientation="horizontal"
            percentProgress={((this.state.activeIndex) / egoFormNames.length) * 100}
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
