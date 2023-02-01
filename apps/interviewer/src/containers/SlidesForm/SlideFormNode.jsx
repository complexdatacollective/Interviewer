import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withProps } from 'recompose';
import { Scroller } from '@codaco/ui';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '@codaco/shared-consts';
import Node from '../Node';
import Form from '../Form';

class SlideFormNode extends PureComponent {
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
      submitButton,
      id,
      otherNetworkEntities,
      onScroll,
    } = this.props;

    return (
      <div className="swiper-slide">
        <div className="slide-content">
          <Node {...item} />
          <div className="alter-form__form-container">
            <Scroller onScroll={onScroll}>
              <Form
                {...form}
                className="alter-form__form"
                initialValues={initialValues}
                autoFocus={false}
                subject={subject}
                onSubmit={this.handleSubmit}
                submitButton={submitButton}
                validationMeta={{ entityId: id }}
                otherNetworkEntities={otherNetworkEntities}
              />
            </Scroller>
          </div>
        </div>
      </div>
    );
  }
}

SlideFormNode.propTypes = {
  form: PropTypes.object,
  subject: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
  onUpdate: PropTypes.func,
  onScroll: PropTypes.func,
  submitButton: PropTypes.object,
};

SlideFormNode.defaultProps = {
  form: {},
  onUpdate: () => { },
  onScroll: () => { },
  submitButton: <button type="submit" key="submit" aria-label="Submit" hidden />,
};

const withNodeProps = withProps(({ item }) => ({
  id: item[entityPrimaryKeyProperty],
  initialValues: item[entityAttributesProperty],
}));

const EnhancedSlideFormNode = withNodeProps(SlideFormNode);

export { EnhancedSlideFormNode as SlideFormNode };

export default withNodeProps(SlideFormNode);
