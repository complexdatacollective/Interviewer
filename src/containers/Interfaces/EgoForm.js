import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import { debounce } from 'lodash';
import { connect } from 'react-redux';
import { Icon, Scroller } from '@codaco/ui';
import { Markdown } from '@codaco/ui/lib/components/Fields';
import { submit, isValid, isDirty } from 'redux-form';
import { entityAttributesProperty } from '@codaco/shared-consts';
import Form from '../Form';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { getNetworkEgo } from '../../selectors/network';
import { getSessionProgress } from '../../selectors/session';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import useReadyForNextStage from '../../hooks/useReadyForNextStage';
import useFlipflop from '../../hooks/useFlipflop';

export const elementHasOverflow = ({
  clientWidth,
  clientHeight,
  scrollWidth,
  scrollHeight,
}) => scrollHeight > clientHeight || scrollWidth > clientWidth;

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
  const [showScrollStatus, setShowScrollStatus] = useFlipflop(true, 7000, false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const [, setIsReadyForNext] = useReadyForNextStage();

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

  // Detect if the scrollable element has overflowing content
  useEffect(() => {
    const element = document.querySelector('.ego-form__form-container-scroller');
    if (!element) { return; }

    setIsOverflowing(elementHasOverflow(element));
  }, []);

  const submitForm = () => {
    reduxFormSubmit(formName);
  };

  const checkShouldProceed = () => {
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

  const showScrollNudge = useMemo(
    () => scrollProgress !== 1 && showScrollStatus && isOverflowing,
    [scrollProgress, showScrollStatus, isOverflowing],
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
            onChange={() => {
              // Reset the scroll nudge timeout each time a form field is changed
              setShowScrollStatus(false);
            }}
          />
        </Scroller>
      </div>
      <AnimatePresence>
        {showScrollNudge && (
          <motion.div
            className="scroll-nudge"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
          >
            <h5>
              Scroll to see more questions
            </h5>
            <motion.div
              animate={{
                y: [0, 7, 0, 7, 0],
              }}
              transition={{
                duration: 2,
                loop: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Icon name="chevron-down" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
