import { reduxForm } from 'redux-form';
import { autoInitialisedForm } from '../../behaviors';
import { Form } from '../../components/Elements';

/**
  * Renders a redux form that contains fields according to a `fields` config.
  */
export default autoInitialisedForm(reduxForm({
  destroyOnUnmount: true,
  forceUnregisterOnUnmount: true,
})(Form));
