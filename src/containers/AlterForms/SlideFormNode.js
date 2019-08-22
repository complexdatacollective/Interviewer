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
      nodeIndex,
      subject,
      stageIndex,
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
                autoFocus={false}
                subject={subject}
                form={`NODE_FORM_${stageIndex}_${nodeIndex + 1}`}
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
  subject: PropTypes.object.isRequired,
  node: PropTypes.object,
  onUpdate: PropTypes.func,
  nodeIndex: PropTypes.number,
  stageIndex: PropTypes.number.isRequired,
};

SlideForm.defaultProps = {
  form: {},
  nodeIndex: 0,
  node: {},
  onUpdate: () => {},
};

export default SlideForm;
