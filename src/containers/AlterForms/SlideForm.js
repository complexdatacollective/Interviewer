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

const confirmDialog = {
  type: 'Confirm',
  title: 'Changes cannot be saved',
  message: 'There are invalid changes in this form, that will not be saved if you continue. Do you want to go back anyway?',
  confirmLabel: 'Leave alter',
};

class SlideForm extends Component {
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
      FormComponent,
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

          {items.map((item, itemIndex) => {
            const slideForm = {
              ...form,
              form: this.getFormName(itemIndex),
            };

            return (
              <FormComponent
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

SlideForm.propTypes = {
  form: PropTypes.object.isRequired,
  stage: PropTypes.object.isRequired,
  items: PropTypes.array,
  stageIndex: PropTypes.number.isRequired,
  submitForm: PropTypes.func.isRequired,
  updateItem: PropTypes.func.isRequired,
  className: PropTypes.string,
  itemName: PropTypes.string,
  FormComponent: PropTypes.elementType.isRequired,
};

SlideForm.defaultProps = {
  items: [],
  className: '',
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

export { SlideForm };

export default withStore(SlideForm);
