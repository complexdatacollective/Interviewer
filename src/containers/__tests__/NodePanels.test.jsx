/* eslint-env jest */


import React from 'react';
import { shallow } from 'enzyme';
import { NodePanels } from '../NodePanels';

jest.mock('@codaco/ui');

const mockProps = {
  removeNode: () => { },
  activePromptAttributes: {},
  newNodeAttributes: {},
  getLabel: () => 'some label',
};

describe('<NodePanels />', () => {
  it('renders ok', () => {
    const component = shallow(<NodePanels {...mockProps} />);

    expect(component).toMatchSnapshot();
  });
});
