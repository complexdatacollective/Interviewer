import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { isValid, isSubmitting, submit } from 'redux-form';
import ReactMarkdown from 'react-markdown';

import Swiper from 'react-id-swiper';
import { ProgressBar } from '../../components';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { makeNetworkNodesForType } from '../../selectors/interface';
import { protocolForms } from '../../selectors/protocol';
import { SlideFormNode } from '../';
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

  getNodeFormName = activeIndex => `NODE_FORM_${activeIndex}`;

  formSubmitAllowed = index => (
    this.swipeRef && this.swipeRef.current.swiper &&
    this.props.formEnabled(this.getNodeFormName(index))
  );

  isStageBeginning = () => (
    this.swipeRef && this.formSubmitAllowed(this.swipeRef.current.swiper.activeIndex) &&
    this.swipeRef.current.swiper.activeIndex === 0
  );

  isStageEnding = () => (
    this.swipeRef && this.formSubmitAllowed(this.swipeRef.current.swiper.activeIndex) &&
    this.swipeRef.current.swiper.activeIndex === this.props.stageNodes.length
  );

  clickNext = () => {
    if (this.swipeRef && this.swipeRef.current) {
      this.props.submitForm(this.getNodeFormName(this.state.activeIndex));
      if (this.formSubmitAllowed(this.state.activeIndex)) {
        this.setState({
          activeIndex: this.state.activeIndex + 1,
        });
        this.swipeRef.current.swiper.slideNext();
      }
    }
  };

  clickPrevious = () => {
    if (this.swipeRef && this.swipeRef.current) {
      if (this.formSubmitAllowed(this.state.activeIndex)) {
        this.props.submitForm(this.getNodeFormName(this.state.activeIndex));
      }
      this.setState({
        activeIndex: this.state.activeIndex - 1,
      });
      this.swipeRef.current.swiper.slidePrev();
    }
  };

  render() {
    const {
      form,
      stage,
      stageNodes,
      updateNode,
    } = this.props;

    const swiperParams = {
      containerClass: 'alter-form__swiper swiper-container',
      direction: 'vertical',
      speed: getCSSVariableAsNumber('--animation-duration-slow-ms'),
      effect: 'coverflow',
      allowTouchMove: false,
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
      <div className="alter-form">
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

          {stageNodes.map((node, index) => (
            <SlideFormNode
              key={index}
              node={node}
              index={index}
              updateNode={updateNode}
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
  formEnabled: PropTypes.func.isRequired,
  stage: PropTypes.object.isRequired,
  stageNodes: PropTypes.array,
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
    const forms = protocolForms(state);
    const currentForm = forms[props.stage.form];
    const entity = currentForm && currentForm.entity;
    const type = currentForm && currentForm.type;
    const stageNodes = getStageNodes(state, {
      ...props,
      stage: { ...props.stage, subject: { entity, type } },
    });

    return {
      form: currentForm,
      formEnabled: formName => isValid(formName)(state) && !isSubmitting(formName)(state),
      stageNodes,
    };
  };
}

const mapDispatchToProps = dispatch => ({
  updateNode: bindActionCreators(sessionsActions.updateNode, dispatch),
  submitForm: bindActionCreators(formName => submit(formName), dispatch),
});

export { AlterForm };

export default compose(
  connect(makeMapStateToProps, mapDispatchToProps, null, { withRef: true }),
)(AlterForm);
