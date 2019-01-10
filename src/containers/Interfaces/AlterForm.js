import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { isDirty, isValid, isSubmitting, reset, submit } from 'redux-form';
import Swiper from 'react-id-swiper';

import { Scroller } from '../../components';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { nodeAttributesProperty, nodePrimaryKeyProperty } from '../../ducks/modules/network';
import { getDefaultFormValues } from '../../selectors/forms';
import { makeNetworkNodesForType } from '../../selectors/interface';
import { protocolForms } from '../../selectors/protocol';
import { Form } from '../';

class AlterForm extends Component {
  constructor(props) {
    super(props);
    this.swipeRef = React.createRef();
  }

  formSubmitAllowed = index => (
    this.swipeRef && this.swipeRef.current.swiper &&
      this.props.formEnabled(`NODE_FORM_${index - 1}`)
  );

  goNext = () => {
    if (this.swipeRef && this.formSubmitAllowed(this.swipeRef.current.swiper.activeIndex)) {
      this.swipeRef.current.swiper.slideNext();
    }
  };

  goPrev = () => {
    if (this.swipeRef && this.formSubmitAllowed(this.swipeRef.current.swiper.activeIndex)) {
      this.swipeRef.current.swiper.slidePrev();
    }
  };

  render() {
    const {
      defaultFormValues,
      form,
      stage,
      stageNodes,
    } = this.props;

    const params = {
      containerClass: 'alter-form swiper-container',
      direction: 'vertical',
      slidesPerView: 'auto',
      centeredSlides: true,
      on: {
        touchStart: () => {
          if (this.swipeRef.current && this.swipeRef.current.swiper) {
            this.swipeRef.current.swiper.allowTouchMove = this.formSubmitAllowed();
          }
        },
        slideChangeTransitionStart: () => {
          if (this.swipeRef.current && this.swipeRef.current.swiper) {
            const submitIndex = this.swipeRef.current.swiper.previousIndex;
            if (!this.formSubmitAllowed(submitIndex)) {
              this.swipeRef.current.swiper.slideTo(submitIndex);
            } else if (this.props.formDirty(`NODE_FORM_${submitIndex - 1}`)) {
              this.props.submitForm(`NODE_FORM_${submitIndex - 1}`);
            }
          }
        },
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      renderPrevButton: () => (<button className="swiper-button-prev">Prev</button>),
      renderNextButton: () => (<button className="swiper-button-next">Next</button>),
    };

    return (
      <Swiper {...params} ref={this.swipeRef} >
        <div key="alter-form__introduction">
          <div>{stage.introductionPanel.title}</div>
          <div>{stage.introductionPanel.text}</div>
        </div>
        {stageNodes.map((node, index) => {
          const nodeAttributes = node ? node[nodeAttributesProperty] : {};

          const initialValues = {
            ...defaultFormValues[stage.form],
            ...nodeAttributes,
          };

          return (
            <div className="alter-form__form swiper-no-swiping" key={node[nodePrimaryKeyProperty]}>
              <Scroller>
                <Form
                  key={node[nodePrimaryKeyProperty]}
                  {...form}
                  initialValues={initialValues}
                  autoFocus={false}
                  form={`NODE_FORM_${index}`}
                  onSubmit={formData => this.props.updateNode(node, formData)}
                />
              </Scroller>
            </div>
          );
        })}
      </Swiper>
    );
  }
}

function makeMapStateToProps() {
  const getStageNodes = makeNetworkNodesForType();

  return function mapStateToProps(state, props) {
    const forms = protocolForms(state);
    const defaultFormValues = getDefaultFormValues(state);
    const currentForm = forms[props.stage.form];
    const stageNodes = getStageNodes(state, {
      ...props,
      stage: { ...props.stage, subject: { entity: currentForm.entity, type: currentForm.type } },
    });

    return {
      form: currentForm,
      formEnabled: formName => isValid(formName)(state) && !isSubmitting(formName)(state),
      formDirty: formName => isDirty(formName)(state),
      defaultFormValues,
      stageNodes,
    };
  };
}

const mapDispatchToProps = dispatch => ({
  resetValues: bindActionCreators(reset, dispatch),
  updateNode: bindActionCreators(sessionsActions.updateNode, dispatch),
  submitForm: bindActionCreators(formName => submit(formName), dispatch),
});

export { AlterForm };

export default compose(
  connect(makeMapStateToProps, mapDispatchToProps),
)(AlterForm);
