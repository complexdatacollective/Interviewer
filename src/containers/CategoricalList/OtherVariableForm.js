import React from 'react';
import { reduxForm, Field } from 'redux-form';
import { get } from 'lodash';
import { withProps, compose } from 'recompose';
import { Button } from '@codaco/ui';
import { Text } from '@codaco/ui/lib/components/Fields';
import { getEntityAttributes, entityPrimaryKeyProperty } from '../../ducks/modules/network';

const stopClickPropagation = e =>
  e.stopPropagation();

const OtherVariableForm = ({
  node,
  otherVariable,
  otherVariableLabel,
  handleSubmit,
  onCancel,
  initialValues,
}) => {
  console.log({ initialValues });
  return (
    <div onClick={stopClickPropagation}>
      <form onSubmit={handleSubmit}>
        <Field
          component={Text}
          label={otherVariableLabel}
          name="otherVariable"
        />

        <Button type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Set as &quot;other&quot; category</Button>
      </form>
    </div>
  );
};

const withMapInitialValues = withProps(({ node, otherVariable }) => ({
  initialValues: {
    attrs: getEntityAttributes(node),
    otr: otherVariable,
    otherVariable: get(getEntityAttributes(node), otherVariable),
  },
}));

export default compose(
  withMapInitialValues,
  reduxForm({ form: 'otherVariableForm' }),
)(OtherVariableForm);
