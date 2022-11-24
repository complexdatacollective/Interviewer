/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { shallow } from 'enzyme';
import { NodePanels } from '../NodePanels';

jest.mock('@codaco/ui/lib/utils/CSSVariables');

const mockProps = {
  removeNode: () => {},
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
