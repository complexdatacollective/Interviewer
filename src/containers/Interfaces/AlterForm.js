import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { submit } from 'redux-form';
import ReactMarkdown from 'react-markdown';
import Swiper from 'react-id-swiper';

import { ProgressBar } from '../../components';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { makeNetworkNodesForType } from '../../selectors/interface';
import { entityPrimaryKeyProperty } from '../../ducks/modules/network';
import { SlideFormNode } from '../AlterForms';
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

class AlterForm extends Component {
  constructor(props) {
    super(props);
    this.swipeRef = React.createRef();
    this.state = {
      activeIndex: 0,
    };
  }

  getNodeFormName = activeIndex => `NODE_FORM_${this.props.stageIndex}_${activeIndex}`;

  beforeNext = (direction) => {
    if (this.isIntroScreen() && direction > 0) {
      this.nextAlter();
      return;
    }

    if (this.isIntroScreen() && direction < 0) {
      this.props.onComplete();
      return;
    }

    this.setState({
      pendingDirection: direction,
    }, () => {
      this.props.submitForm(this.getNodeFormName(this.state.activeIndex));
    });
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

  isLastAlter = () => this.state.activeIndex === this.props.stageNodes.length

  handleUpdate = (node, formData) => {
    const { pendingDirection } = this.state;
    const { updateNode, onComplete } = this.props;

    updateNode(node[entityPrimaryKeyProperty], {}, formData);

    if (
      (this.isIntroScreen() && pendingDirection < 0) ||
      (this.isLastAlter() && pendingDirection > 0)
    ) {
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

    return {
      form: props.stage.form,
      stageNodes,
    };
  };
}

const mapDispatchToProps = {
  updateNode: sessionsActions.updateNode,
  submitForm: submit,
};

const withStore = connect(makeMapStateToProps, mapDispatchToProps, null, { withRef: true });

export { AlterForm };

export default withStore(AlterForm);
