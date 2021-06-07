/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ProgressBar } from '@codaco/ui';
import { submit, isValid, isDirty } from 'redux-form';
import Swiper from 'react-id-swiper';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import useGetFormName from '../../hooks/useGetFormName';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';

const confirmDialog = {
  type: 'Confirm',
  title: 'Discard changes?',
  message: 'This form contains invalid data, so it cannot be saved. If you continue it will be reset and your changes will be lost. Do you want to discard your changes?',
  confirmLabel: 'Discard changes',
};

const SlidesForm = (props) => {
  const {
    form,
    stage,
    items,
    slideForm: SlideForm,
    submitFormRedux,
    parentClass,
    registerBeforeNext,
    onComplete,
    openDialog,
    getIsFormValid,
    getIsFormDirty,
    updateItem,
  } = props;

  const getFormName = useGetFormName(stage);

  const [pendingDirection, setPendingDirection] = useState(null);
  const [pendingStage, setPendingStage] = useState(-1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiper, updateSwiper] = useState(null);

  const getItemIndex = () => activeIndex - 1;

  const isIntroScreen = () => activeIndex === 0;

  // Determine if we should leave the stage
  const shouldContinue = (direction) => {
    if (items.length === 0) { return true; }
    if (isIntroScreen() && direction < 0) { return true; }
    return false;
  };

  const previousItem = () => {
    setActiveIndex(getItemIndex());
    swiper.slidePrev();
  };

  const nextItem = () => {
    setActiveIndex(activeIndex + 1);
    swiper.slideNext();
  };

  const isLastItem = () => activeIndex >= items.length;

  const submitForm = () => {
    submitFormRedux(getFormName(getItemIndex()));
  };

  const handleConfirmBack = (confirmed) => {
    if (confirmed) {
      previousItem();
      return;
    }

    submitForm();
  };

  const isFormValid = () => {
    const formName = getFormName(getItemIndex());
    return getIsFormValid(formName);
  };

  const isFormDirty = () => {
    const formName = getFormName(getItemIndex());
    return getIsFormDirty(formName);
  };

  const confirmIfChanged = () => {
    if (!isFormDirty()) { return Promise.resolve(true); }
    return openDialog(confirmDialog);
  };

  /**
   * Called by ProtocolScreen before navigating away from this stage
   *
   * If this `beforeNext` method is defined on an interfaces, the
   * navigation will be blocked until `onComplete()` is
   * called, which allows async events to happen such as form submission.
   */
  const beforeNext = (direction, index = -1) => {
    const isPendingStageChange = (index !== -1);
    if (isPendingStageChange) {
      if (isFormValid() && isFormDirty()) {
        setPendingStage(index);
        submitForm(); // submit and handleUpdate will complete
      } else {
        confirmIfChanged()
          .then((confirmed) => {
            if (confirmed) {
              onComplete(direction); // show next stage and lose changes
              return;
            }
            submitForm(); // submit so errors will display
          });
      }
      return;
    }

    setPendingStage(index);
    // Determine if we should leave the stage.
    if (shouldContinue(direction)) {
      onComplete(direction);
      return;
    }

    if (isIntroScreen() && direction > 0) {
      nextItem();
      return;
    }

    if (direction < 0 && !isFormValid()) {
      confirmIfChanged()
        .then(handleConfirmBack);
      return;
    }

    setPendingStage(index);
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

  const isComplete = (direction, stageIndex) => {
    if (isIntroScreen() && direction < 0) { return true; }
    if (isLastItem() && direction > 0) { return true; }
    if (stageIndex !== -1) { return true; }
    return false;
  };

  const handleUpdate = (...update) => {
    updateItem(...update);

    if (isComplete(pendingDirection, pendingStage)) {
      onComplete(pendingDirection);
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
  }, [swiper, beforeNext]);

  // enter key should always move forward, and needs to process using beforeNext
  const handleEnterSubmit = (e) => {
    beforeNext(1);
    e.preventDefault();
  };

  return (
    <div className={parentClasses}>
      <Swiper {...swiperParams} getSwiper={updateSwiper}>
        <div>
          <div key="alter-form__introduction" className="slide-content alter-form__introduction">
            <h1>{stage.introductionPanel.title}</h1>
            <Markdown
              label={stage.introductionPanel.text}
            />
          </div>
        </div>

        {items.map((item, itemIndex) => {
          const formName = getFormName(itemIndex);
          const slideForm = {
            ...form,
            form: formName,
          };

          return (
            <SlideForm
              key={itemIndex}
              subject={stage.subject}
              item={item}
              onUpdate={handleUpdate}
              form={slideForm}
              submitButton={<button type="submit" key="submit" aria-label="Submit" hidden onClick={handleEnterSubmit} />}
            />
          );
        })}
      </Swiper>
      <div className={progressClasses}>
        <h6 className="progress-container__status-text">
          <strong>{activeIndex}</strong>
          {' '}
          of
          {' '}
          <strong>{items.length}</strong>
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
  submitFormRedux: PropTypes.func.isRequired,
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
  const getIsFormValid = (formName) => isValid(formName)(state);
  const getIsFormDirty = (formName) => isDirty(formName)(state);

  return {
    form: props.stage.form,
    getIsFormValid,
    getIsFormDirty,
  };
};

const mapDispatchToProps = {
  submitFormRedux: submit,
  openDialog: dialogActions.openDialog,
};

const withStore = connect(mapStateToProps, mapDispatchToProps);

export { SlidesForm };

export default withStore(SlidesForm);
