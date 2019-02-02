import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Scroller } from '../components';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '../ducks/modules/network';
import Node from './Node';
import { Form } from './';

class SlideForm extends PureComponent {
  render() {
    const {
      form,
      updateNode,
      node,
      index,
    } = this.props;

    return (
      <div className="swiper-slide">
        <div className="slide-content">
          <Node {...node} />
          <div className="alter-form__form-container">
            <Scroller>
              <Form
                {...form}
                className="alter-form__form"
                initialValues={node[entityAttributesProperty]}
                controls={[]}
                autoFocus={false}
                form={`NODE_FORM_${index + 1}`}
                onSubmit={formData => updateNode(node[entityPrimaryKeyProperty], {}, formData)}
              />
            </Scroller>
          </div>
        </div>
      </div>
    );
  }
}

SlideForm.propTypes = {
  form: PropTypes.object,
  updateNode: PropTypes.func,
  node: PropTypes.object,
  index: PropTypes.number,
};

SlideForm.defaultProps = {
  form: {},
  index: 0,
  node: {},
  updateNode: () => {},
};

export default SlideForm;
