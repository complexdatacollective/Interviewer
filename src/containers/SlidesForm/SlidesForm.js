import React, { useState, useEffect } from 'react';
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

const getFormName = uid =>
  `${uuid()}_${uid}`;


const SlidesForm = (props) => {
  const {
    form,
    stage,
    items,
    slideForm: SlideForm,
    submitForm: submitFormRedux,
    parentClass,
    registerBeforeNext,
    onComplete,
    openDialog,
    getIsFormValid,
    updateItem,
  } = props;

  const [pendingDirection, setPendingDirection] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiper, updateSwiper] = useState(null);

  const isIntroScreen = () => activeIndex === 0;

  const shouldContinue = (direction) => {
    if (items.length === 0) { return true; }
    if (isIntroScreen() && direction < 0) { return true; }
    return false;
  };

  const previousItem = () => {
    setActiveIndex(activeIndex - 1);
    swiper.slidePrev();
  };

  const nextItem = () => {
    setActiveIndex(activeIndex + 1);
    swiper.slideNext();
  };

  const isLastItem = () => activeIndex === items.length;

  const submitForm = () => {
    submitFormRedux(getFormName(activeIndex - 1));
  };

  const handleConfirmBack = (confirm) => {
    if (confirm) {
      previousItem();
      return;
    }

    submitForm();
  };

  const isFormValid = () => {
    const formName = getFormName(activeIndex - 1);
    return getIsFormValid(formName);
  };

  /**
   * Called by ProtocolScreen before navigating away from this stage
   *
   * If this `beforeNext` method is defined on an interfaces, the
   * navigation will be blocked until `onContinue()` is
   * called, which allows async events to happen such as form submission.
   */
  const beforeNext = (direction) => {
    if (shouldContinue(direction)) {
      onComplete();
      return;
    }

    if (isIntroScreen() && direction > 0) {
      nextItem();
      return;
    }

    if (direction < 0 && !isFormValid()) {
      openDialog(confirmDialog)
        .then(handleConfirmBack);
      return;
    }

    setPendingDirection(direction);
    submitForm();
  };

  const swiperParams = {
    direction: 'vertical',
    containerClass: 'alter-form__swiper swiper-container',
    speed: getCSSVariableAsNumber('--animation-duration-slow-ms'),
    slidesPerView: 'auto',
    centeredSlides: true,
  };

  const progressClasses = cx(
    'progress-container',
    {
      'progress-container--show': activeIndex > 0,
    },
  );

  const parentClasses = cx(
    'alter-form swiper-no-swiping',
    parentClass,
  );

  const isComplete = (direction) => {
    if (isIntroScreen() && direction < 0) { return true; }
    if (isLastItem() && direction > 0) { return true; }
    return false;
  };

  const handleUpdate = (...update) => {
    updateItem(...update);

    if (isComplete(pendingDirection)) {
      onComplete();
      return;
    }

    if (pendingDirection < 0) {
      previousItem();
      return;
    }

    nextItem();
  };

  useEffect(() => {
    registerBeforeNext(beforeNext);
  }, [beforeNext]);

  return (
    <div className={parentClasses}>
      <Swiper {...swiperParams} getSwiper={updateSwiper} >
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
            form: getFormName(itemIndex),
          };

          return (
            <SlideForm
              key={itemIndex}
              subject={stage.subject}
              item={item}
              onUpdate={handleUpdate}
              form={slideForm}
            />
          );
        })}
      </Swiper>
      <div className={progressClasses}>
        <h6 className="progress-container__status-text">
          <strong>{activeIndex}</strong> of <strong>{items.length}</strong>
        </h6>
        <ProgressBar orientation="horizontal" percentProgress={(activeIndex / items.length) * 100} />
      </div>
    </div>
  );
};

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
