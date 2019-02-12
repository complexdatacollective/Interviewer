import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { isValid, isSubmitting, submit } from 'redux-form';
import ReactMarkdown from 'react-markdown';
import Swiper from 'react-id-swiper';

import { ProgressBar } from '../../components';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { protocolForms } from '../../selectors/protocol';
import { networkEgo } from '../../selectors/interface';
import { SlideFormEgo } from '../AlterForms';
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

class EgoForm extends Component {
  constructor(props) {
    super(props);
    this.swipeRef = React.createRef();
    this.state = {
      activeIndex: 0,
    };
  }

  getNodeFormName = activeIndex => `EGO_FORM_${activeIndex}`;

  formSubmitAllowed = index => (
    this.props.formEnabled(this.getNodeFormName(index))
  );

  isStageBeginning = () => (
    this.state.activeIndex === 0
  );

  isStageEnding = () => (
    this.formSubmitAllowed(this.state.activeIndex) &&
    this.state.activeIndex === this.props.egoFormNames.length
  );

  clickNext = () => {
    if (this.state.activeIndex > 0) {
      this.props.submitForm(this.getNodeFormName(this.state.activeIndex));
    }
    if (this.state.activeIndex < this.props.egoFormNames.length &&
      (this.state.activeIndex === 0 || this.formSubmitAllowed(this.state.activeIndex))) {
      this.setState({
        activeIndex: this.state.activeIndex + 1,
      });
      if (this.state.activeIndex === 0) {
        this.swipeRef.current.swiper.slideNext();
      }
    }
  };

  clickPrevious = () => {
    if (this.state.activeIndex > 0 && this.formSubmitAllowed(this.state.activeIndex)) {
      this.props.submitForm(this.getNodeFormName(this.state.activeIndex));
    }
    if (this.state.activeIndex > 0) {
      this.setState({
        activeIndex: this.state.activeIndex - 1,
      });
      if (this.state.activeIndex === 1) {
        this.swipeRef.current.swiper.slidePrev();
      }
    }
  };

  handleSubmitForm = formData => this.props.updateEgo(this.props.ego, formData);

  render() {
    const {
      allForms,
      egoFormNames,
      ego,
      stage,
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

    const currentForm = this.state.activeIndex > 0 ?
      allForms[egoFormNames[this.state.activeIndex - 1]] : allForms[egoFormNames[0]];
    const formIndex = this.state.activeIndex > 0 ? this.state.activeIndex : 0;

    return (
      <div className="ego-form alter-form swiper-no-swiping">
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
          <SlideFormEgo
            ego={ego}
            form={currentForm}
            formName={this.getNodeFormName(formIndex)}
            index={formIndex}
            updateEgo={this.handleSubmitForm}
          />
        </Swiper>
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
