/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { NodePanels } from '../../Elements/NodePanels';

const mockProps = {
  toggleNodeAttributes: () => {},
  removeNode: () => {},
  activePromptAttributes: () => {},
  newNodeAttributes: () => {},
};

describe('<NodePanels />', () => {
  it('renders ok', () => {
    const component = shallow(<NodePanels {...mockProps} />);

    expect(component).toMatchSnapshot();
  });
});
