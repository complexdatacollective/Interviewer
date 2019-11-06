import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { submit } from 'redux-form';
import ReactMarkdown from 'react-markdown';
import Swiper from 'react-id-swiper';
import { ProgressBar } from '../../components';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { makeNetworkEdgesForType } from '../../selectors/interface';
import { SlideFormEdge } from '../AlterForms';
import defaultMarkdownRenderers from '../../utils/markdownRenderers';
import { getCSSVariableAsNumber } from '../../ui/utils/CSSVariables';

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

class AlterEdgeForm extends Component {
  constructor(props) {
    super(props);
    this.swipeRef = React.createRef();
    this.state = {
      activeIndex: 0,
    };
  }

  getEdgeFormName = activeIndex => `EDGE_FORM_${this.props.stageIndex}_${activeIndex}`;

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
      this.nextEdge();
      return;
    }

    this.setState({
      pendingDirection: direction,
    }, () => {
      this.props.submitForm(this.getEdgeFormName(this.state.activeIndex));
    });
  }

  previousEdge() {
    this.setState({
      activeIndex: this.state.activeIndex - 1,
    });
    this.swipeRef.current.swiper.slidePrev();
  }

  nextEdge() {
    this.setState({
      activeIndex: this.state.activeIndex + 1,
    });
    this.swipeRef.current.swiper.slideNext();
  }

  isIntroScreen = () => this.state.activeIndex === 0;

  isLastEdge = () => this.state.activeIndex === this.props.stageEdges.length;

  shouldContinue = (direction) => {
    if (this.props.stageEdges.length === 0) { return true; }
    if (this.isIntroScreen() && direction < 0) { return true; }
    return false;
  }

  isComplete = (direction) => {
    if (this.isIntroScreen() && direction < 0) { return true; }
    if (this.isLastEdge() && direction > 0) { return true; }
    return false;
  }

  handleUpdate = (formData) => {
    const { pendingDirection } = this.state;
    const { updateEdge, onComplete } = this.props;

    updateEdge(formData);

    if (this.isComplete(pendingDirection)) {
      onComplete();
      return;
    }

    if (pendingDirection < 0) {
      this.previousEdge();
      return;
    }

    this.nextEdge();
  };

  render() {
    const {
      form,
      stage,
      stageEdges,
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
      <div className="alter-form alter-edge-form swiper-no-swiping">
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

          {stageEdges.map((edge, edgeIndex) => (
            <SlideFormEdge
              key={edgeIndex}
              subject={stage.subject}
              edge={edge}
              edgeIndex={edgeIndex}
              stageIndex={stageIndex}
              updateEdge={this.handleUpdate}
              form={form}
            />
          ))}
        </Swiper>
        <div className={progressClasses}>
          <h6 className="progress-container__status-text">
            <strong>{this.state.activeIndex}</strong> of <strong>{stageEdges.length}</strong>
          </h6>
          <ProgressBar orientation="horizontal" percentProgress={(this.state.activeIndex / stageEdges.length) * 100} />
        </div>
      </div>
    );
  }
}

AlterEdgeForm.propTypes = {
  form: PropTypes.object.isRequired,
  stage: PropTypes.object.isRequired,
  stageEdges: PropTypes.array,
  stageIndex: PropTypes.number.isRequired,
  submitForm: PropTypes.func.isRequired,
  updateEdge: PropTypes.func.isRequired,
};

AlterEdgeForm.defaultProps = {
  stageEdges: [],
};

function makeMapStateToProps() {
  const getStageEdges = makeNetworkEdgesForType();

  return function mapStateToProps(state, props) {
    const currentForm = props.stage.form;
    const stageEdges = getStageEdges(state, props);

    return {
      form: currentForm,
      stageEdges,
    };
  };
}

const mapDispatchToProps = {
  updateEdge: sessionsActions.updateEdge,
  submitForm: submit,
};

const withStore = connect(makeMapStateToProps, mapDispatchToProps, null, { withRef: true });

export { AlterEdgeForm };

export default withStore(AlterEdgeForm);
