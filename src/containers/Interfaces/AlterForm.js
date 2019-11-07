import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { submit, isValid } from 'redux-form';
import ReactMarkdown from 'react-markdown';
import Swiper from 'react-id-swiper';
import { ProgressBar } from '../../components';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { makeNetworkNodesForType } from '../../selectors/interface';
import { entityPrimaryKeyProperty } from '../../ducks/modules/network';
import { SlideFormNode } from '../AlterForms';
import defaultMarkdownRenderers from '../../utils/markdownRenderers';
import { getCSSVariableAsNumber } from '../../ui/utils/CSSVariables';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';

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

const confirmDialog = {
  type: 'Confirm',
  title: 'Changes cannot be saved',
  message: 'There are invalid changes in this form, that will not be saved if you continue. Do you want to go back anyway?',
  confirmLabel: 'Leave alter',
};

class AlterForm extends Component {
  constructor(props) {
    super(props);
    this.swipeRef = React.createRef();
    this.state = {
      activeIndex: 0,
    };
  }

  getNodeFormName = () =>
    `NODE_FORM_${this.props.stageIndex}_${this.state.activeIndex}`;

  /**
   * Called by ProtocolScreen before navigating away from this stage
   *
   * If this `beforeNext` method is defined on an interfaces, the
   * navigation will be blocked until `this.props.onContinue()` is
   * called, which allows async events to happen such as form submission.
   */
  beforeNext = (direction) => {
    if (this.shouldContinue(direction)) {
      this.props.onComplete();
      return;
    }

    if (this.isIntroScreen() && direction > 0) {
      this.nextAlter();
      return;
    }

    if (direction < 0 && !this.isFormValid()) {
      this.props.openDialog(confirmDialog)
        .then(this.handleConfirmNavigation);
      return;
    }

    this.setState({
      pendingDirection: direction,
    }, () => {
      this.submitForm();
    });
  }

  handleConfirmNavigation = (confirm) => {
    if (confirm) {
      this.props.onComplete();
      return;
    }

    this.submitForm();
  };

  isFormValid = () => {
    const formName = this.getNodeFormName();
    return this.props.getIsFormValid(formName);
  };

  submitForm = () => {
    this.props.submitForm(this.getNodeFormName());
  }

  previousAlter() {
    this.setState({
      activeIndex: this.state.activeIndex - 1,
    });
    this.swipeRef.current.swiper.slidePrev();
  }

  nextAlter() {
    this.setState({
      activeIndex: this.state.activeIndex + 1,
    });
    this.swipeRef.current.swiper.slideNext();
  }

  isIntroScreen = () => this.state.activeIndex === 0;

  isLastAlter = () => this.state.activeIndex === this.props.stageNodes.length;

  shouldContinue = (direction) => {
    if (this.props.stageNodes.length === 0) { return true; }
    if (this.isIntroScreen() && direction < 0) { return true; }
    return false;
  }

  isComplete = (direction) => {
    if (this.isIntroScreen() && direction < 0) { return true; }
    if (this.isLastAlter() && direction > 0) { return true; }
    return false;
  }

  handleUpdate = (node, formData) => {
    const { pendingDirection } = this.state;
    const { updateNode, onComplete } = this.props;

    updateNode(node[entityPrimaryKeyProperty], {}, formData);

    if (this.isComplete(pendingDirection)) {
      onComplete();
      return;
    }

    if (pendingDirection < 0) {
      this.previousAlter();
      return;
    }

    this.nextAlter();
  };

  render() {
    const {
      form,
      stage,
      stageNodes,
      stageIndex,
    } = this.props;

    const swiperParams = {
      containerClass: 'alter-form__swiper swiper-container',
      direction: 'vertical',
      speed: getCSSVariableAsNumber('--animation-duration-slow-ms'),
      effect: 'coverflow',
      coverflowEffect: {
        rotate: 30,
        slideShadows: false,
      },
      slidesPerView: 'auto',
      centeredSlides: true,
    };

    const progressClasses = cx(
      'progress-container',
      {
        'progress-container--show': this.state.activeIndex > 0,
      },
    );

    return (
      <div className="alter-form swiper-no-swiping">
        <Swiper {...swiperParams} ref={this.swipeRef} >
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

          {stageNodes.map((node, nodeIndex) => (
            <SlideFormNode
              key={nodeIndex}
              subject={stage.subject}
              node={node}
              nodeIndex={nodeIndex}
              stageIndex={stageIndex}
              onUpdate={this.handleUpdate}
              form={form}
            />
          ))}
        </Swiper>
        <div className={progressClasses}>
          <h6 className="progress-container__status-text">
            <strong>{this.state.activeIndex}</strong> of <strong>{stageNodes.length}</strong>
          </h6>
          <ProgressBar orientation="horizontal" percentProgress={(this.state.activeIndex / stageNodes.length) * 100} />
        </div>
      </div>
    );
  }
}

AlterForm.propTypes = {
  form: PropTypes.object,
  stage: PropTypes.object.isRequired,
  stageNodes: PropTypes.array,
  stageIndex: PropTypes.number.isRequired,
  submitForm: PropTypes.func.isRequired,
  updateNode: PropTypes.func.isRequired,
};

AlterForm.defaultProps = {
  form: {},
  stageNodes: [],
};

function makeMapStateToProps() {
  const getStageNodes = makeNetworkNodesForType();

  return function mapStateToProps(state, props) {
    const stageNodes = getStageNodes(state, props);
    const getIsFormValid = formName =>
      isValid(formName)(state);

    return {
      form: props.stage.form,
      stageNodes,
      getIsFormValid,
    };
  };
}

const mapDispatchToProps = {
  updateNode: sessionsActions.updateNode,
  submitForm: submit,
  openDialog: dialogActions.openDialog,
};

const withStore = connect(makeMapStateToProps, mapDispatchToProps, null, { withRef: true });

export { AlterForm };

export default withStore(AlterForm);
