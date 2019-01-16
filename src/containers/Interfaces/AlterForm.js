import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { isValid, isSubmitting, submit } from 'redux-form';
import Swiper from 'react-id-swiper';

import { Scroller } from '../../components';
import Node from '../Node';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { nodeAttributesProperty, nodePrimaryKeyProperty } from '../../ducks/modules/network';
import { getDefaultFormValues } from '../../selectors/forms';
import { makeNetworkNodesForType } from '../../selectors/interface';
import { protocolForms } from '../../selectors/protocol';
import { Progress } from '../../ui/components';
import { Form } from '../';
import { getItemComponent } from './Information';
import { getCSSVariableAsNumber } from '../../ui/utils/CSSVariables';

class AlterForm extends Component {
  constructor(props) {
    super(props);
    this.swipeRef = React.createRef();
    this.state = {
      activeIndex: 0,
    };
  }

  onSlideTransition = () => {
    if (this.swipeRef.current && this.swipeRef.current.swiper) {
      const submitIndex = this.swipeRef.current.swiper.previousIndex;
      // try to submit (on fail, form is "touched" and errors can show)
      this.props.submitForm(this.getNodeFormName(submitIndex));
      if (!this.formSubmitAllowed(submitIndex)) {
        this.swipeRef.current.swiper.slideTo(submitIndex,
          getCSSVariableAsNumber('--animation-duration-fast-ms'), false);
      } else {
        this.setState({
          activeIndex: this.swipeRef.current.swiper.activeIndex,
        });
      }
    }
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
      if (this.swipeRef.current.swiper.isEnd) {
        this.props.submitForm(this.getNodeFormName(this.state.activeIndex));
      } else {
        this.swipeRef.current.swiper.slideNext();
      }
    }
  };

  clickPrevious = () => {
    if (this.swipeRef && this.swipeRef.current) {
      this.swipeRef.current.swiper.slidePrev();
    }
  };

  clickLast = () => {
    this.props.submitForm(this.getNodeFormName(this.state.activeIndex));
  }

  renderNodeForms = () => {
    const {
      defaultFormValues,
      form,
      updateNode,
      stage,
      stageNodes,
    } = this.props;

    return (
      stageNodes.map((node, index) => {
        const nodeAttributes = node ? node[nodeAttributesProperty] : {};

        const initialValues = {
          ...defaultFormValues[stage.form],
          ...nodeAttributes,
        };

        return (
          <div key={node[nodePrimaryKeyProperty]}>
            <div className="slide-content">
              <Node {...node} />
              <div className="alter-form__form-container">
                <Scroller>
                  <Form
                    {...form}
                    className="alter-form__form"
                    initialValues={initialValues}
                    controls={[]}
                    autoFocus={false}
                    form={`NODE_FORM_${index + 1}`}
                    onSubmit={formData => updateNode(node, formData)}
                  />
                </Scroller>
              </div>
            </div>
          </div>
        );
      })
    );
  }

  render() {
    const {
      stage,
      stageNodes,
    } = this.props;

    const swiperParams = {
      containerClass: 'alter-form__swiper swiper-container',
      direction: 'vertical',
      speed: getCSSVariableAsNumber('--animation-duration-slow-ms'),
      effect: 'coverflow',
      touchRatio: 2,
      coverflowEffect: {
        rotate: 30,
        slideShadows: false,
      },
      slidesPerView: 'auto',
      centeredSlides: true,
      on: {
        slideChangeTransitionStart: this.onSlideTransition,
      },
    };

    return (
      <div className="alter-form">
        <Swiper {...swiperParams} ref={this.swipeRef} >
          <div>
            <div key="alter-form__introduction" className="slide-content alter-form__introduction">
              <h1>{stage.introductionPanel.title}</h1>
              <div>{getItemComponent({ content: stage.introductionPanel.text, type: 'text' })}</div>
            </div>
          </div>

          {this.renderNodeForms()}
        </Swiper>
        <div
          className={cx(
            'progress-container',
            {
              'progress-container--show': this.state.activeIndex > 0,
            },
          )}
        >
          <h6 className="progress-container__status-text">
            <strong>{this.state.activeIndex}</strong> of <strong>{stageNodes.length}</strong>
          </h6>
          <Progress
            max={stageNodes.length}
            value={this.state.activeIndex}
            className="alter-form__progress"
          />
        </div>
      </div>
    );
  }
}

AlterForm.propTypes = {
  defaultFormValues: PropTypes.object.isRequired,
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
    const defaultFormValues = getDefaultFormValues(state);
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
      defaultFormValues,
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
