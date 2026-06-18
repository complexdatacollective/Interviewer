import { shallow } from 'enzyme';
import { createStore } from 'redux';
import { vi } from 'vitest';

import NodeList from '../NodeList';

vi.mock('@codaco/ui/lib/utils/CSSVariables');

const mockStore = createStore(() => ({
  droppable: { activeZones: [] },
  draggable: { draggingFromIds: {} },
}));

describe('NodeList component', () => {
  it('renders ok', () => {
    const component = shallow(
      <NodeList id="foo" listId="foo_bar" store={mockStore} />,
    );

    expect(component).toMatchSnapshot();
  });
});
