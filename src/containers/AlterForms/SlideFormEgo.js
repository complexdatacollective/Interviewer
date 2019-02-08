import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { TransitionGroup } from 'react-transition-group';

import { Scroller } from '../../components';
import { Folder as FolderTransition } from '../../components/Transition';
import { entityAttributesProperty } from '../../ducks/modules/network';
import { makeGetEgoColor, makeGetEgoLabel } from '../../selectors/protocol';
import { Node as UINode } from '../../ui/components';
import { Form } from '..';

class SlideFormEgo extends PureComponent {
  render() {
    const {
      color,
      ego,
      form,
      formName,
      index,
      label,
      updateEgo,
    } = this.props;

    return (
      <div className="swiper-slide">
        <div className="slide-content">
          <UINode {...ego} label={label} color={color} />
          <div className="ego-form__form-container alter-form__form-container">
            <TransitionGroup className="slide__transition">
              <FolderTransition key={`ego-${index}`}>
                <Scroller>
                  <Form
                    {...form}
                    className="alter-form__form"
                    initialValues={ego[entityAttributesProperty]}
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
  color: PropTypes.string.isRequired,
  ego: PropTypes.object,
  form: PropTypes.object,
  formName: PropTypes.string,
  label: PropTypes.string.isRequired,
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

function makeMapStateToProps(state) {
  const getEgoColor = makeGetEgoColor();
  const getEgoLabel = makeGetEgoLabel();

  return {
    color: getEgoColor(state),
    label: getEgoLabel(state),
  };
}

export default connect(makeMapStateToProps)(SlideFormEgo);

export { SlideFormEgo };
