/* eslint-env jest */

import React from 'react';
import { shallow, mount } from 'enzyme';

import { UnconnectedAlterForm as AlterForm } from '../AlterForm';
import { UnconnectedCategoricalBin as CategoricalBin } from '../CategoricalBin';

const requiredProps = {
  nodesForPrompt: [],
  prompt: {},
  stage: {},
  promptBackward: jest.fn(),
  promptForward: jest.fn(),
};

const mockProps = {
  defaultFormValues: { formID: {} },
  form: { entity: 'node', type: 'type-id', fields: [] },
  formEnabled: () => true,
  stage: { form: 'formID', introductionPanel: { title: 'Title', text: 'Text' } },
  stageNodes: [{ uid: 1 }, { uid: 2 }],
  updateNode: jest.fn(),
};

describe('The AlterForm Interface', () => {
  it('Renders slides', () => {
    const component = shallow(<CategoricalBin {...requiredProps} />);
    console.log(component.children());

    const elem = shallow(<AlterForm {...mockProps} />);
    console.log(elem.children());
    expect(elem.find('progress')).toHaveLength(1);
    expect(elem.find('.swiper-slide')).toHaveLength(3);
  });


  it('calls update node', () => {
    const elem = mount(<AlterForm {...mockProps} />);
    elem.instance().clickNext();
    expect(mockProps.updateNode).toHaveBeenCalled();
  });
});
