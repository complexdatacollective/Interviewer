import React, { useEffect, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { debounce } from 'lodash';
import { connect } from 'react-redux';
import { Scroller } from '@codaco/ui';
import { Markdown } from '@codaco/ui/lib/components/Fields';
import { submit, isValid, isDirty } from 'redux-form';
import { isIOS } from '../../utils/Environment';
import Form from '../Form';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { getNetworkEgo } from '../../selectors/network';
import { getSessionProgress } from '../../selectors/session';
import { entityAttributesProperty } from '../../ducks/modules/network';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import useReadyForNextStage from '../../hooks/useReadyForNextStage';
import useFlipflop from '../../hooks/useFlipflop';

const confirmDialog = {
  type: 'Confirm',
  title: 'Discard changes?',
  message: 'This form contains invalid data, so it cannot be saved. If you continue it will be reset and your changes will be lost. Do you want to discard your changes?',
  confirmLabel: 'Discard changes',
};

const getFormName = (index) => `EGO_FORM_${index}`;

const EgoForm = ({
  ego,
  form,
  formName,
  introductionPanel,
  isFirstStage,
  isFormDirty,
  isFormValid,
  onComplete,
  openDialog,
  registerBeforeNext,
  submitForm: reduxFormSubmit,
  updateEgo,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [, setIsReadyForNext] = useReadyForNextStage();
  const [showScrollStatus, setShowScrollStatus] = useFlipflop(true, 5000);
  const formState = useRef({
    isFormDirty,
    isFormValid,
  });

  useEffect(() => {
    formState.current = {
      isFormDirty,
      isFormValid,
    };
  }, [isFormDirty, isFormValid]);

  const submitForm = () => {
    reduxFormSubmit(formName);
  };

  const checkShouldProceed = () => {
    console.log({ formState });
    if (!formState.current.isFormDirty) { return Promise.resolve(true); }
    return openDialog(confirmDialog);
  };

  const onConfirmProceed = (confirm) => {
    if (confirm) {
      onComplete();
      return;
    }

    submitForm();
  };

  const checkAndProceed = () => checkShouldProceed()
    .then(onConfirmProceed);

  const beforeNext = (direction, index = -1) => {
    const isPendingStageChange = (index !== -1);
    const isBackwards = direction < 0;

    if (isPendingStageChange) {
      if (formState.current.isFormValid) {
        submitForm();
      } else {
        checkAndProceed();
      }
      return;
    }

    if (!isFirstStage && isBackwards && !formState.current.isFormValid) {
      checkAndProceed();
      return;
    }

    submitForm();
  };

  useEffect(() => {
    registerBeforeNext(beforeNext);
  }, []);

  const handleSubmitForm = (formData) => {
    updateEgo({}, formData);
    onComplete();
  };

  const updateReadyStatus = useCallback(debounce((progress) => {
    const nextIsReady = isFormValid && progress === 1;
    setIsReadyForNext(nextIsReady);
  }, 200), [isFormValid, setIsReadyForNext]);

  const handleScroll = useCallback((_, progress) => {
    setShowScrollStatus(false);
    setScrollProgress(progress);

    updateReadyStatus(progress);
  }, [isFormValid, setShowScrollStatus, setScrollProgress, updateReadyStatus]);

  useEffect(() => {
    if (!isFormValid) { setIsReadyForNext(false); }
  }, [isFormValid]);

  const progressClasses = cx(
    'progress-container',
    'progress-container--status-only',
    {
      'progress-container--show': !isIOS() && scrollProgress !== 1 && showScrollStatus,
    },
  );

  return (
    <div className="ego-form alter-form">
      <div className="ego-form__form-container">
        <Scroller className="ego-form__form-container-scroller" onScroll={handleScroll}>
          <div className="ego-form__introduction">
            <h1>{introductionPanel.title}</h1>
            <Markdown
              label={introductionPanel.text}
            />
          </div>
          <Form
            {...form}
            initialValues={ego[entityAttributesProperty]}
            form={formName}
            subject={{ entity: 'ego' }}
            onSubmit={handleSubmitForm}
          />
        </Scroller>
      </div>
      <div className={progressClasses}>
        Scroll to see more questions...
      </div>
    </div>
  );
};

EgoForm.propTypes = {
  form: PropTypes.object.isRequired,
  introductionPanel: PropTypes.object.isRequired,
  ego: PropTypes.object,
  stageIndex: PropTypes.number.isRequired,
  submitForm: PropTypes.func.isRequired,
  updateEgo: PropTypes.func.isRequired,
};

EgoForm.defaultProps = {
  ego: {},
};

function mapStateToProps(state, props) {
  const ego = getNetworkEgo(state);
  const formName = getFormName(props.stageIndex);
  const isFormValid = isValid(formName)(state);
  const isFormDirty = () => isDirty(formName)(state);
  const { isFirstStage } = getSessionProgress(state);

  return {
    form: props.stage.form,
    introductionPanel: props.stage.introductionPanel,
    ego,
    isFormValid,
    isFormDirty,
    formName,
    isFirstStage,
  };
}

const mapDispatchToProps = {
  updateEgo: sessionsActions.updateEgo,
  submitForm: submit,
  openDialog: dialogActions.openDialog,
};

const withStore = connect(mapStateToProps, mapDispatchToProps);

export { EgoForm };

export default withStore(EgoForm);
