import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Scroller } from '../../components';
import { entityAttributesProperty } from '../../ducks/modules/network';
import Node from '../Node';
import { Form } from '..';

class SlideForm extends PureComponent {
  handleSubmit = (formData) => {
    const { node, onUpdate } = this.props;
    onUpdate(node, formData);
  }

  render() {
    const {
      form,
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
                onSubmit={this.handleSubmit}
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
  node: PropTypes.object,
  onUpdate: PropTypes.func,
  index: PropTypes.number,
};

SlideForm.defaultProps = {
  form: {},
  index: 0,
  node: {},
  onUpdate: () => {},
};

export default SlideForm;
