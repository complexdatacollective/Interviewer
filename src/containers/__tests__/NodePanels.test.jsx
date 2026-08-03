import { shallow } from 'enzyme';
import { vi } from 'vitest';

import { NodePanels } from '../NodePanels';

vi.mock('@codaco/ui/lib/utils/CSSVariables');

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
