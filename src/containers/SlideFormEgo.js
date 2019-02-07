import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TransitionGroup } from 'react-transition-group';

import { Scroller } from '../components';
import { Folder as FolderTransition } from '../components/Transition';
import { nodeAttributesProperty } from '../ducks/modules/network';
import { Node as UINode } from '../ui/components';
import { Form } from '.';

class SlideFormEgo extends PureComponent {
  render() {
    const {
      ego,
      form,
      formName,
      index,
      updateEgo,
    } = this.props;

    return (
      <div className="swiper-slide">
        <div className="slide-content">
          <UINode {...ego} label="You" />
          <div className="ego-form__form-container alter-form__form-container">
            <TransitionGroup className="slide__transition">
              <FolderTransition key={`ego-${index}`}>
                <Scroller>
                  <Form
                    {...form}
                    className="alter-form__form"
                    initialValues={ego[nodeAttributesProperty]}
                    controls={[]}
                    autoFocus={false}
                    form={formName}
                    onSubmit={updateEgo}
                  />
                </Scroller>
              </FolderTransition>
            </TransitionGroup>
          </div>
        </div>
      </div>
    );
  }
}

SlideFormEgo.propTypes = {
  ego: PropTypes.object,
  form: PropTypes.object,
  formName: PropTypes.string,
  updateEgo: PropTypes.func,
  index: PropTypes.number,
};

SlideFormEgo.defaultProps = {
  ego: {},
  form: {},
  formName: 'EGO_FORM',
  index: 0,
  updateEgo: () => { },
};

export default SlideFormEgo;
