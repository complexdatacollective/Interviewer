import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { submit, isValid } from 'redux-form';
import ReactMarkdown from 'react-markdown';
import uuid from 'uuid';
import Swiper from 'react-id-swiper';
import { ProgressBar } from '../../components';
import defaultMarkdownRenderers from '../../utils/markdownRenderers';
import { getCSSVariableAsNumber } from '../../ui/utils/CSSVariables';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { ALLOWED_MARKDOWN_TAGS } from '../../config';


const confirmDialog = {
  type: 'Confirm',
  title: 'Discard changes?',
  message: 'This form contains invalid data, so it cannot be saved. If you continue it will be reset and your changes will be lost. Do you want to discard your changes?',
  confirmLabel: 'Discard changes',
};

class SlidesForm extends Component {
  constructor(props) {
    super(props);
    this.swipeRef = React.createRef();
    this.state = {
      activeIndex: 0,
      formPrefix: uuid(),
    };
  }

  componentDidMount() {
    this.props.registerBeforeNext(this.beforeNext);
  }

  getItemIndex = () =>
    this.state.activeIndex - 1;

  getFormName = uid =>
    `${this.state.formPrefix}_${uid}`;

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
      this.nextItem();
      return;
    }

    if (direction < 0 && !this.isFormValid()) {
      this.props.openDialog(confirmDialog)
        .then(this.handleConfirmBack);
      return;
    }

    this.setState({
      pendingDirection: direction,
    }, () => {
      this.submitForm();
    });
  }

  handleConfirmBack = (confirm) => {
    if (confirm) {
      this.previousItem();
      return;
    }

    this.submitForm();
  };

  isFormValid = () => {
    const formName = this.getFormName(this.getItemIndex());
    return this.props.getIsFormValid(formName);
  };

  submitForm = () => {
    this.props.submitForm(this.getFormName(this.getItemIndex()));
  }

  previousItem() {
    this.setState({
      activeIndex: this.state.activeIndex - 1,
    });
    this.swipeRef.current.swiper.slidePrev();
  }

  nextItem() {
    this.setState({
      activeIndex: this.state.activeIndex + 1,
    });
    this.swipeRef.current.swiper.slideNext();
  }

  isIntroScreen = () => this.state.activeIndex === 0;

  isLastItem = () => this.state.activeIndex === this.props.items.length;

  shouldContinue = (direction) => {
    if (this.props.items.length === 0) { return true; }
    if (this.isIntroScreen() && direction < 0) { return true; }
    return false;
  }

  isComplete = (direction) => {
    if (this.isIntroScreen() && direction < 0) { return true; }
    if (this.isLastItem() && direction > 0) { return true; }
    return false;
  }

  handleUpdate = (...update) => {
    const { pendingDirection } = this.state;
    const { updateItem, onComplete } = this.props;

    updateItem(...update);

    if (this.isComplete(pendingDirection)) {
      onComplete();
      return;
    }

    if (pendingDirection < 0) {
      this.previousItem();
      return;
    }

    this.nextItem();
  };

  render() {
    const {
      form,
      stage,
      items,
      slideForm: SlideForm,
      parentClass,
    } = this.props;

    const swiperParams = {
      direction: 'vertical',
      containerClass: 'alter-form__swiper swiper-container',
      speed: getCSSVariableAsNumber('--animation-duration-slow-ms'),
      // effect: 'coverflow',
      // coverflowEffect: {
      //   rotate: 30,
      //   slideShadows: false,
      // },
      slidesPerView: 'auto',
      centeredSlides: true,
    };

    const progressClasses = cx(
      'progress-container',
      {
        'progress-container--show': this.state.activeIndex > 0,
      },
    );

    const parentClasses = cx(
      'alter-form swiper-no-swiping',
      parentClass,
    );

    return (
      <div className={parentClasses}>
        <Swiper {...swiperParams} ref={this.swipeRef} >
          <div>
            <div key="alter-form__introduction" className="slide-content alter-form__introduction">
              <h1>{stage.introductionPanel.title}</h1>
              <ReactMarkdown
                source={stage.introductionPanel.text}
                allowedTypes={ALLOWED_MARKDOWN_TAGS}
                renderers={defaultMarkdownRenderers}
              />
            </div>
          </div>

          {items.map((item, itemIndex) => {
            const slideForm = {
              ...form,
              form: this.getFormName(itemIndex),
            };

            return (
              <SlideForm
                key={itemIndex}
                subject={stage.subject}
                item={item}
                onUpdate={this.handleUpdate}
                form={slideForm}
              />
            );
          })}
        </Swiper>
        <div className={progressClasses}>
          <h6 className="progress-container__status-text">
            <strong>{this.state.activeIndex}</strong> of <strong>{items.length}</strong>
          </h6>
          <ProgressBar orientation="horizontal" percentProgress={(this.state.activeIndex / items.length) * 100} />
        </div>
      </div>
    );
  }
}

SlidesForm.propTypes = {
  form: PropTypes.object.isRequired,
  stage: PropTypes.object.isRequired,
  items: PropTypes.array,
  stageIndex: PropTypes.number.isRequired,
  submitForm: PropTypes.func.isRequired,
  updateItem: PropTypes.func.isRequired,
  className: PropTypes.string,
  parentClass: PropTypes.string,
  itemName: PropTypes.string,
  slideForm: PropTypes.elementType.isRequired,
};

SlidesForm.defaultProps = {
  items: [],
  className: '',
  parentClass: '',
  itemName: '',
};

const mapStateToProps = (state, props) => {
  const getIsFormValid = formName =>
    isValid(formName)(state);

  return {
    form: props.stage.form,
    getIsFormValid,
  };
};

const mapDispatchToProps = {
  submitForm: submit,
  openDialog: dialogActions.openDialog,
};

const withStore = connect(mapStateToProps, mapDispatchToProps);

export { SlidesForm };

export default withStore(SlidesForm);
