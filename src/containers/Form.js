import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { reduxForm, getFormValues, getFormMeta } from 'redux-form';
import { autoInitialisedForm } from '../behaviours';
import Field from './Field';
import { makeRehydrateFields } from '../selectors/forms';

const getScrollParent = (node) => {
  const regex = /(auto|scroll)/;
  const parents = (_node, ps) => {
    if (_node.parentNode === null) { return ps; }
    return parents(_node.parentNode, ps.concat([_node]));
  };

  const style = (_node, prop) => getComputedStyle(_node, null).getPropertyValue(prop);
  const overflow = (_node) => style(_node, 'overflow') + style(_node, 'overflow-y') + style(_node, 'overflow-x');
  const scroll = (_node) => regex.test(overflow(_node));

  /* eslint-disable consistent-return */
  const scrollParent = (_node) => {
    if (!(_node instanceof HTMLElement || _node instanceof SVGElement)) {
      return;
    }

    const ps = parents(_node.parentNode, []);

    for (let i = 0; i < ps.length; i += 1) {
      if (scroll(ps[i])) {
        return ps[i];
      }
    }

    return document.scrollingElement || document.documentElement;
  };

  return scrollParent(node);
  /* eslint-enable consistent-return */
};

const scrollToFirstError = (errors) => {
  // Todo: first item is an assumption that may not be valid. Should iterate and check
  // vertical position to ensure it is actually the "first" in page order (topmost).
  if (!errors) { return; }

  const firstError = Object.keys(errors)[0];

  // All Fields have a name corresponding to variable ID so look this up.
  // When used on alter form, multiple forms can be differentiated by the active slide
  // class. This needs priority, so look it up first.
  const el = document.querySelector(`.swiper-slide-active [name="${firstError}"]`)
    || document.querySelector(`[name="${firstError}"]`);

  // If element is not found, prevent crash.
  if (!el) {
    // eslint-disable-next-line no-console
    console.warn(`scrollToFirstError(): Element [name="${firstError}"] not found in DOM`);
    return;
  }

  // Subtract 200 to put more of the input in view.
  const topPos = el.offsetTop - 200;

  // Assume forms are inside a scrollable
  const scroller = getScrollParent(el);

  scroller.scrollTop = topPos;
};

/**
  * Renders a redux form that contains fields according to a `fields` config.
  */
class Form extends Component {
  handleFieldBlur = () => {
    const { autoPopulate } = this.props;
    if (!autoPopulate) { return; }

    const {
      meta: {
        fields,
        values,
      },
      dirty,
      autofill,
    } = this.props;

    // if we don't check dirty state, this ends up firing and auto populating fields
    // when it shouldn't, like when closing the form
    if (dirty) {
      autoPopulate(fields, values, autofill);
    }
  };

  render() {
    const {
      autoFocus,
      fields,
      handleSubmit,
      tooltip,
      className,
      submitButton,
      children,
    } = this.props;

    return (
      <form className={className} onSubmit={handleSubmit} autoComplete="off">
        {fields.map((field, index) => {
          const isFirst = autoFocus && index === 0;
          return (
            <Field
              key={`${field.name} ${index}`}
              {...field}
              autoFocus={isFirst}
              onBlur={() => { this.handleFieldBlur(); }}
              tooltip={tooltip}
            />
          );
        })}
        {submitButton}
        {children}
      </form>
    );
  }
}

Form.propTypes = {
  autofill: PropTypes.func.isRequired,
  autoFocus: PropTypes.bool,
  autoPopulate: PropTypes.func,
  dirty: PropTypes.bool.isRequired,
  form: PropTypes.string.isRequired,
  fields: PropTypes.array.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  meta: PropTypes.object.isRequired,
  className: PropTypes.string,
  tooltip: PropTypes.string,
  submitButton: PropTypes.object,
  initialValues: PropTypes.object,
  validationMeta: PropTypes.object,
  otherNetworkEntities: PropTypes.object,
  subject: PropTypes.object.isRequired, // Implicit dependency used by autoInitialisedForm
};

Form.defaultProps = {
  autoFocus: false,
  autoPopulate: null,
  className: null,
  tooltip: 'none',
  initialValues: null,
  // redux wants a "submit" button in order to enable submit with an enter key, even if hidden
  submitButton: <button type="submit" key="submit" aria-label="Submit" hidden />,
  validationMeta: {},
  otherNetworkEntities: {},
};

function makeMapStateToProps() {
  const rehydrateFields = makeRehydrateFields();

  return function mapStateToProps(state, props) {
    return {
      meta: {
        fields: getFormMeta(props.form)(state),
        values: getFormValues(props.form)(state),
      },
      fields: rehydrateFields(state, props),
      initialValues: props.initialValues,
    };
  };
}

export default compose(
  connect(makeMapStateToProps),
  autoInitialisedForm,
  reduxForm({
    enableReinitialize: true, // form could have ego out of sync because submit is in progress
    touchOnChange: true,
    touchOnBlur: false,
    onSubmitFail: scrollToFirstError,
  }),
)(Form);

export {
  Form,
};
