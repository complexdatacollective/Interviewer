import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withProps } from 'recompose';
import { Scroller } from '../../components';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '../../ducks/modules/network';
import Node from '../Node';
import Form from '../Form';

class SlideForm extends PureComponent {
  handleSubmit = (formData) => {
    const { id, item, onUpdate } = this.props;
    // TODO: is item (node) neccessary?
    onUpdate(id, item, formData);
  }

  render() {
    const {
      form,
      item,
      initialValues,
      subject,
    } = this.props;

    return (
      <div className="swiper-slide">
        <div className="slide-content">
          <Node {...item} />
          <div className="alter-form__form-container">
            <Scroller>
              <Form
                {...form}
                className="alter-form__form"
                initialValues={initialValues}
                autoFocus={false}
                subject={subject}
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
  item: PropTypes.object,
  onUpdate: PropTypes.func,
};

SlideForm.defaultProps = {
  form: {},
  item: {},
  onUpdate: () => {},
};

const withNodeProps = withProps(({ item }) => ({
  id: item[entityPrimaryKeyProperty],
  initialValues: item[entityAttributesProperty],
}));

export default withNodeProps(SlideForm);
